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
const unicode = require('unicode-encode');
const dotProp = require('dot-prop');
const crypto = require('crypto');
const { stripDangerousGlobals } = require('./workerGlobals.js');

// Fonctions lodash qui COMPILENT / EXÉCUTENT du code (host realm, hors vm).
// lodash.template compile son corps avec un Function du host realm → échappe au
// contexte vm et à stripDangerousGlobals (RCE signalée par Maxim Yakovlev). On
// expose une copie de lodash SANS ces fonctions (défense en profondeur).
const LODASH_STRIPPED = ['template', 'templateSettings'];

function decodeUnicode(str) {
  const regex = new RegExp('\\\\u([\\dA-Fa-f]{4})', 'g');
  return str.replace(regex, (m, g) => String.fromCharCode(parseInt(g, 16)));
}

function makeSafeLodash() {
  const safe = {};
  for (const key of Object.keys(lodash)) {
    if (!LODASH_STRIPPED.includes(key)) safe[key] = lodash[key];
  }
  try {
    Object.freeze(safe);
  } catch (e) { /* non gelable */ }
  return safe;
}

// Libs/helpers exposés aux expressions (mêmes identifiants que le scope master),
// en version épurée et gelée.
function makeHelpers() {
  const helpers = {
    dayjs,
    moment,
    lodash: makeSafeLodash(),
    he,
    removeMarkdown,
    sanitizeHtml,
    cheerio,
    decodeUnicode,
    dotProp,
    unicode,
    crypto,
    Buffer
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
  stripDangerousGlobals,
  LODASH_STRIPPED
};
