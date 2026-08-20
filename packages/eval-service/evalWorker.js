'use strict';

// -----------------------------------------------------------------------------
// evalWorker (eval-service) — worker_threads PERSISTANT qui exécute les
// évaluations reçues par message (pool de workers, voir workerPool.js).
//
// Chaque job est exécuté dans un contexte vm NEUF : aucun état ne peut
// transiter entre deux évaluations (globals posés, pollution de prototype,
// mutation d'un helper) — tout reste dans le contexte jeté à la fin du job.
//
// Les libs (dayjs, moment, lodash, ...) sont chargées UNE SEULE FOIS à la
// création du worker puis injectées dans chaque contexte, GELÉES pour
// empêcher une éval de muter un objet partagé entre jobs.
//
// Le timeout du `vm.runInContext` coupe les boucles JS ; le pool termine le
// worker (timer de secours) pour les regex natives catastrophiques que le
// timeout vm ne peut pas interrompre.
//
// Les globals Node dangereux (require/module/process/global/console) sont
// retirés du worker AVANT tout job ; le contexte vm n'expose de toute façon
// que les helpers + variables listés ci-dessous.
// -----------------------------------------------------------------------------

const { parentPort } = require('worker_threads');
const vm = require('vm');
const { stripDangerousGlobals } = require('./workerGlobals.js');

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

function decodeUnicode(str) {
  const regex = new RegExp('\\\\u([\\dA-Fa-f]{4})', 'g');
  return str.replace(regex, (m, g) => String.fromCharCode(parseInt(g, 16)));
}

// Helpers compatibles avec le scope master (utilisés par certaines expressions).
function resolveString(source) {
  if (typeof source === 'string' || source instanceof String) {
    const strict = /^eval\(this\.unicode\.atou\(`([^`]*)`\)\)$/.exec(source);
    if (strict) return unicode.atou(strict[1]);
    return source;
  } else if (Array.isArray(source)) {
    return source.map((r) => resolveString(r));
  } else if (source != null && typeof source === 'object') {
    const out = {};
    for (const key in source) out[unicode.atou(key)] = resolveString(source[key]);
    return out;
  }
  return source;
}
function escapeString(source) {
  if (typeof source === 'string' || source instanceof String) {
    return `eval(this.unicode.atou(\`${unicode.utoa(source)}\`))`;
  } else if (Array.isArray(source)) {
    return source.map((r) => escapeString(r));
  } else if (source != null && source.toJSON !== undefined) {
    return escapeString(source.toJSON());
  } else if (source != null && typeof source === 'object') {
    const out = {};
    for (const key in source) out[unicode.utoa(key)] = escapeString(source[key]);
    return out;
  }
  return source;
}
function parseAndResolveString(source) {
  return resolveString(JSON.parse(source));
}

// Fonctions lodash qui COMPILENT / EXÉCUTENT du code (host realm, hors vm).
// lodash.template compile son corps avec un Function du host realm → échappe au
// contexte vm et à stripDangerousGlobals (RCE signalée par Maxim Yakovlev). On
// expose une copie de lodash SANS ces fonctions (défense en profondeur : même si
// le validateur était contourné, elles ne sont pas disponibles dans le worker).
const LODASH_STRIPPED = ['template', 'templateSettings'];
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

// Libs/helpers exposés aux expressions (mêmes identifiants que le scope
// master). Gelés : une éval ne peut pas ajouter/écraser de propriété sur un
// objet partagé entre jobs.
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
  resolveString,
  escapeString,
  parseAndResolveString,
  Buffer
};
for (const name of Object.keys(helpers)) {
  const value = helpers[name];
  if (value && (typeof value === 'object' || typeof value === 'function')) {
    try {
      Object.freeze(value);
    } catch (e) {
      /* non gelable : on continue */
    }
  }
}

stripDangerousGlobals();

parentPort.on('message', (msg) => {
  if (!msg || msg.type !== 'job') return;
  const { jobId, expression, variables, timeoutMs } = msg;

  // Contexte NEUF à chaque job : l'expression ne voit que CE contexte.
  // importModuleDynamically : on rejette TOUT import() dynamique (les imports
  // depuis le contexte vm doivent échouer). NB : ne couvre PAS le host realm
  // (via une fonction compilant du code comme lodash.template) — géré par le
  // validateur + lodash stripped + recyclage du worker.
  const ctx = vm.createContext({}, {
    importModuleDynamically: () => Promise.reject(new Error('dynamic import is forbidden in eval-service'))
  });
  Object.assign(ctx, helpers);
  if (variables) Object.assign(ctx, variables);

  try {
    // eslint-disable-next-line no-eval
    const result = vm.runInContext(expression, ctx, { timeout: timeoutMs });
    parentPort.postMessage({ type: 'result', jobId, ok: true, result });
  } catch (e) {
    parentPort.postMessage({
      type: 'result',
      jobId,
      ok: false,
      error: e && e.message ? e.message : String(e)
    });
  }
});