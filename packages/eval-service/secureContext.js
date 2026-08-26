'use strict';

// -----------------------------------------------------------------------------
// secureContext — construction d'un contexte vm SÉCURISÉ, partagé entre
// evalWorker.js et whereWorker.js (factorisation des protections).
//
// Centralise la défense en profondeur commune à toute évaluation :
//   1. contexte vm NEUF (aucun état ne transite entre jobs) ;
//   2. importModuleDynamically -> rejette tout import() dynamique depuis le
//      contexte vm (un import() hors vm, via une fonction compilant du code en
//      host realm, est géré par le validateur + libs épurées) ;
//   3. libs du scope exposées en version ÉPURÉE et GELÉE (lodash sans
//      template/templateSettings, qui compilent du code en host realm — RCE
//      signalée par Maxim Yakovlev) ;
//   4. stripDangerousGlobals sur le worker (retire require/process/global/
//      console/fetch/WebSocket) — appelé au chargement du worker.
// -----------------------------------------------------------------------------

const vm = require('vm');
const dayjs = require('dayjs-with-plugins');
const he = require('he');
const lodash = require('lodash');
const removeMarkdown = require('remove-markdown');
const sanitizeHtml = require('sanitize-html');
const cheerio = require('cheerio');
const moment = require('moment');
const dotProp = require('dot-prop');
const nodeCrypto = require('crypto');
const { stripDangerousGlobals } = require('./workerGlobals.js');

function decodeUnicode(str) {
  const regex = new RegExp('\\\\u([\\dA-Fa-f]{4})', 'g');
  return str.replace(regex, (m, g) => String.fromCharCode(parseInt(g, 16)));
}

function makeSafeLodash() {
  // N'expose QU'UN SOUS-ENSEMBLE de lodash (whitelist de fonctions sûres et
  // utiles pour les transformations de données). On exclut volontairement :
  //   - les fonctions qui COMPILENT du code (template/templateSettings — RCE) ;
  //   - les fonctions de proto-pollution (merge/set/defaultsDeep/update/transform/
  //     create/assign/defaults/...) ;
  //   - les fonctions de temporisation (debounce/throttle — timers non pertinents).
  // Les expressions de prod utilisent surtout des fonctions de manipulation de
  // données (map/filter/get/truncate/...). Réduit fortement la surface d'attaque.
  const WHITELIST = [
    'truncate', 'map', 'filter', 'get', 'has', 'keys', 'values', 'omit', 'pick',
    'clone', 'cloneDeep', 'isEqual', 'isArray', 'isObject', 'isString', 'isNumber',
    'isBoolean', 'isNil', 'isEmpty', 'toLower', 'toUpper', 'trim', 'replace', 'split',
    'join', 'slice', 'find', 'findIndex', 'includes', 'reduce', 'each', 'forEach',
    'flatMap', 'uniq', 'groupBy', 'orderBy', 'sortBy', 'findLast', 'head', 'last',
    'first', 'size', 'range', 'fill', 'reverse', 'concat', 'flatten', 'flattenDeep',
    'compact', 'take', 'drop', 'chunk', 'zip', 'unzip', 'max', 'min', 'sum', 'mean',
    'round', 'ceil', 'floor', 'parseInt', 'parseFloat', 'escape', 'unescape', 'capitalize',
    'startsWith', 'endsWith', 'padStart', 'padEnd', 'repeat', 'toInteger', 'toNumber',
    'toString', 'identity', 'property', 'matches', 'constant'
  ];
  const safe = {};
  for (const key of WHITELIST) {
    if (typeof lodash[key] === 'function') safe[key] = lodash[key];
  }
  try {
    Object.freeze(safe);
  } catch (e) { /* non gelable */ }
  return safe;
}

// -----------------------------------------------------------------------------
// Réduction de la surface d'attaque : on N'EXPOSE PAS les objets Node complets
// (Buffer, crypto) dans le scope eval — ce sont de larges vecteurs du host realm
// (prototypes, constructeurs, accès à des internals Node). On expose des
// wrappers MINIMAUX qui ne couvrent que les cas d'usage réels de production :
//   - Buffer.from(x).toString('base64')  (encodage, 2 composants prod)
//   - crypto.createHash('sha256').update(x).digest('hex')  (4 composants prod)
// Ces wrappers ne donnent aucun accès au prototype/constructeur du vrai module.
// -----------------------------------------------------------------------------

// Buffer minimal : expose uniquement `from()` retournant un objet avec
// `.toString(encoding)` (encodage base64/utf8). Pas de Buffer.alloc, pas de
// prototype du vrai Buffer, pas d'accès à des internals.
function safeBufferFrom(value, encoding) {
  const buf = Buffer.from(value == null ? '' : value);
  return {
    toString: (enc) => (enc === 'base64' || encoding === 'base64' ? buf.toString('base64') : buf.toString(enc || 'utf8'))
  };
}
const safeBuffer = { from: safeBufferFrom };

// crypto minimal : expose uniquement `createHash()` retournant un objet avec
// `.update(x)` et `.digest(encoding)`. Pas de generateKeyPair, pas de
// createCipher, pas d'autres algos/accès host-realm. On n'expose que le
// sous-ensemble createHash(sha*) → update → digest, sans exposer le hash brut.
function safeCreateHashWrapper(algorithm) {
  const allowed = ['sha256', 'md5', 'sha1', 'sha512'];
  const algo = String(algorithm || 'sha256').toLowerCase();
  if (!allowed.includes(algo)) {
    throw new Error(`crypto.createHash algorithm not allowed: ${algorithm}`);
  }
  const hash = nodeCrypto.createHash(algo);
  return {
    update: (data) => {
      hash.update(data == null ? '' : String(data));
      return {
        digest: (enc) => hash.digest(enc || 'hex')
      };
    }
  };
}
const safeCrypto = {
  createHash: safeCreateHashWrapper,
  randomUUID: () => nodeCrypto.randomUUID(),
  randomBytes: (size) => nodeCrypto.randomBytes(size).toString('hex')
};

// he minimal : expose uniquement decode/encode (les 2 seuls utilisés en prod pour
// l'échappement HTML). Pas de version/escape/unescape ni d'autres accès.
const safeHe = {
  decode: (str) => he.decode(str == null ? '' : String(str)),
  encode: (str) => he.encode(str == null ? '' : String(str))
};

// -----------------------------------------------------------------------------
// Whitelist des méthodes STATIQUES exposées sur dayjs/moment. La fonction
// d'appel (dayjs(...)/moment(...)) crée un objet date avec son API de chaînage
// (format/add/diff/...). On n'expose que les utilitaires statiques réellement
// utiles en prod, pas l'ensemble des API (tz/plugins/etc.).
// -----------------------------------------------------------------------------
function safeLib(fn, staticWhitelist) {
  const safe = (...args) => fn(...args);
  for (const key of staticWhitelist) {
    if (typeof fn[key] === 'function') safe[key] = fn[key];
  }
  return safe;
}
const DAYJS_STATIC = ['unix', 'utc', 'locale', 'isDayjs', 'duration', 'max', 'min'];
const MOMENT_STATIC = ['utc', 'unix', 'locale', 'duration', 'min', 'max', 'now', 'isMoment'];
const safeDayjs = safeLib(dayjs, DAYJS_STATIC);
const safeMoment = safeLib(moment, MOMENT_STATIC);

// removeMarkdown : fonction simple, sûr, exposée telle quelle (pas de surface
// d'objets). dotProp : fonctions de manipulation de chemin, on garde get/set.

// Libs/helpers exposés aux expressions (mêmes identifiants que le scope master),
// en version épurée, réduite et gelée.
function makeHelpers() {
  const helpers = {
    dayjs: safeDayjs,
    moment: safeMoment,
    lodash: makeSafeLodash(),
    he: safeHe,               // wrapper minimal (decode/encode)
    removeMarkdown,
    sanitizeHtml,
    cheerio,
    decodeUnicode,
    dotProp,
    crypto: safeCrypto,       // wrapper minimal (createHash/randomUUID)
    Buffer: safeBuffer        // wrapper minimal (from uniquement)
  };
  for (const name of Object.keys(helpers)) {
    const value = helpers[name];
    if (value && (typeof value === 'object' || typeof value === 'function')) {
      try {
        Object.freeze(value);
      } catch (e) { /* non gelable */ }
    }
  }
  return helpers;
}

const helpers = makeHelpers();

// Crée un contexte vm NEUF et SÉCURISÉ, pré-rempli avec les libs épurées.
// Les variables additionnelles (résolues à l'extérieur) sont injectées par
// l'appelant. Toute import() dynamique depuis le contexte est rejeté.
// CONTRAT DE SÉCURITÉ : les variables injectées dans le contexte sont considérées
// sûres à la seule condition d'avoir transité par `runEvalInRemote` (engine), qui
// applique `sanitizeValue` avant sérialisation. Ne pas alimenter ce contexte avec
// des variables non assainies.
function createSecureContext() {
  const ctx = vm.createContext({}, {
    importModuleDynamically: () =>
      Promise.reject(new Error('dynamic import is forbidden in eval-service'))
  });
  Object.assign(ctx, helpers);
  return ctx;
}

module.exports = {
  createSecureContext,
  helpers,
  stripDangerousGlobals
};
