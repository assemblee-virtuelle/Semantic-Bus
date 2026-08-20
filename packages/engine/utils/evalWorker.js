'use strict';

// -----------------------------------------------------------------------------
// evalWorker — worker_threads qui exécute une expression de transformation (eval)
// dans un thread séparé et TERMINABLE (point 3 : timeout / DoS).
//
// Le thread principal bloque dans `runEvalInWorker` (Promise) et, si le délai est
// dépassé, appelle `worker.terminate()` : le eval (boucle déguisée, ReDoS, ...)
// ne peut plus bloquer indéfiniment le process engine.
//
// Le scope expose exactement les mêmes identifiants que le `eval` master de
// objectTransformationV2 (libs par nom + helpers), pour une compatibilité 100%
// des expressions de production. Les valeurs injectées (base64 via `unicode`) y
// sont référencées par `this.resolveString(...)` / `this.parseAndResolveString(...)`.
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

function escapeString(source) {
  if (typeof source === 'string' || source instanceof String) {
    return `eval(this.unicode.atou(\`${unicode.utoa(source)}\`))`;
  } else if (Array.isArray(source)) {
    return source.map(r => escapeString(r));
  } else if (source != null && source.toJSON !== undefined) {
    return escapeString(source.toJSON());
  } else if (source != null && typeof source === 'object') {
    const out = {};
    for (const key in source) {
      out[unicode.utoa(key)] = escapeString(source[key]);
    }
    return out;
  }
  return source;
}

function resolveString(source) {
  if (typeof source === 'string' || source instanceof String) {
    const strict = /^eval\(this\.unicode\.atou\(`([^`]*)`\)\)$/.exec(source);
    if (strict) {
      return unicode.atou(strict[1]);
    }
    return source;
  } else if (Array.isArray(source)) {
    return source.map(r => resolveString(r));
  } else if (source != null && typeof source === 'object') {
    const out = {};
    for (const key in source) {
      out[unicode.atou(key)] = resolveString(source[key]);
    }
    return out;
  }
  return source;
}

function parseAndResolveString(source) {
  return resolveString(JSON.parse(source));
}

// Expose les libs + helpers sur le global : le eval master utilisait le scope
// de module (variables libres) ET `this.xxx` (this = objet module, mais en mode
// non-strict le `this` du eval pointe sur le global). On attache donc tout au
// global pour que `this.resolveString(...)` et `dayjs(...)` fonctionnent.
globalThis.dayjs = dayjs;
globalThis.moment = moment;
// lodash épuré : on retire template/templateSettings (compilent du code en host
// realm, échappent au vm → RCE). Défense en profondeur (moteur de test).
const LODASH_STRIPPED = ['template', 'templateSettings'];
globalThis.lodash = Object.fromEntries(
  Object.entries(lodash).filter(([k]) => !LODASH_STRIPPED.includes(k))
);
globalThis.he = he;
globalThis.removeMarkdown = removeMarkdown;
globalThis.sanitizeHtml = sanitizeHtml;
globalThis.cheerio = cheerio;
globalThis.decodeUnicode = decodeUnicode;
globalThis.dotProp = dotProp;
globalThis.unicode = unicode;
// Expose le module Node `crypto` (createHash, randomBytes, randomUUID, ...).
// NB : globalThis.crypto est un accessor natif (WebCrypto) configurable ; on le
// remplace par le module Node pour les expressions de prod qui utilisent
// crypto.createHash(...). 
Object.defineProperty(globalThis, 'crypto', {
  value: crypto,
  writable: true,
  configurable: true,
  enumerable: true
});
globalThis.resolveString = resolveString;
globalThis.escapeString = escapeString;
globalThis.parseAndResolveString = parseAndResolveString;

// Variables additionnelles passées par le thread principal (sécurisées).
if (workerData && workerData.scope) {
  for (const key of Object.keys(workerData.scope)) {
    globalThis[key] = workerData.scope[key];
  }
}

// SÉCURITÉ : retire du global du worker les globals Node dangereux
// (require/module/process/global/console) AVANT toute évaluation. Un `eval`
// présent dans une expression utilisateur (ex. `eval('new '+... )` en prod) ne
// peut donc PAS atteindre `require`/`process`/fs → pas de RCE par `eval` même
// si `eval` est autorisé pour la compatibilité. `Buffer`/`crypto` restent.
stripDangerousGlobals();

let result;
try {
  // Indirect eval : `this` pointe sur le global (où sont exposés les helpers /
  // libs), reproduisant le scope non-strict du eval master où `this.resolveString`
  // et `this.unicode` étaient accessibles. Les identifiants (dayjs, moment, ...)
  // sont exposés via globalThis.
  // eslint-disable-next-line no-eval
  result = (0, eval)(workerData.expression);
} catch (e) {
  parentPort.postMessage({ ok: false, error: e && e.message ? e.message : String(e) });
  return;
}

parentPort.postMessage({ ok: true, result });
