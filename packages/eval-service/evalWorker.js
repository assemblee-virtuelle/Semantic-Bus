'use strict';

// -----------------------------------------------------------------------------
// evalWorker (eval-service) — worker_threads interne qui exécute UNE évaluation
// dans un thread isolé et TERMINABLE (timeout).
//
// Le service d'évaluation lance chaque éval dans ce worker : il expose les libs
// (dayjs, moment, lodash, he, ...) + les variables résolues à l'extérieur, puis
// évalue l'expression. Le thread principal du service tue ce worker en cas de
// timeout (DoS contenu dans le container).
//
// Les globals Node dangereux (require/module/process/global/console) sont retirés
// du `globalThis` AVANT l'évaluation : un `eval` interne (compat production, ex.
// `eval('new '+...)`) ne peut donc PAS accéder au système.
// -----------------------------------------------------------------------------

const { parentPort, workerData } = require('worker_threads');
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
    return source.map(r => resolveString(r));
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
    return source.map(r => escapeString(r));
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

// Expose les libs + helpers (mêmes identifiants que le scope master).
globalThis.dayjs = dayjs;
globalThis.moment = moment;
globalThis.lodash = lodash;
globalThis.he = he;
globalThis.removeMarkdown = removeMarkdown;
globalThis.sanitizeHtml = sanitizeHtml;
globalThis.cheerio = cheerio;
globalThis.decodeUnicode = decodeUnicode;
globalThis.dotProp = dotProp;
globalThis.unicode = unicode;
Object.defineProperty(globalThis, 'crypto', {
  value: crypto, writable: true, configurable: true, enumerable: true
});
globalThis.resolveString = resolveString;
globalThis.escapeString = escapeString;
globalThis.parseAndResolveString = parseAndResolveString;

// Variables résolues à l'extérieur du container (séparées de l'expression).
if (workerData && workerData.variables) {
  for (const key of Object.keys(workerData.variables)) {
    globalThis[key] = workerData.variables[key];
  }
}

// Retire les globals Node dangereux AVANT l'évaluation.
stripDangerousGlobals();

let result;
try {
  // Indirect eval : `this` pointe sur le global (scope master).
  // eslint-disable-next-line no-eval
  result = (0, eval)(workerData.expression);
} catch (e) {
  parentPort.postMessage({ ok: false, error: e && e.message ? e.message : String(e) });
  return;
}

parentPort.postMessage({ ok: true, result });
