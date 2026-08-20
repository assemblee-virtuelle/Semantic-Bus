'use strict';

// -----------------------------------------------------------------------------
// evalWorker (eval-service) — worker_threads PERSISTANT qui exécute les
// évaluations reçues par message (pool de workers, voir workerPool.js).
//
// Chaque job est exécuté dans un contexte vm NEUF, construit par
// secureContext.js (factorisation des protections communes avec whereWorker) :
//   - contexte vm neuf (aucun état ne transite entre jobs) ;
//   - import() dynamique rejeté (importModuleDynamically) ;
//   - libs épurées et gelées (lodash sans template/templateSettings) ;
//   - stripDangerousGlobals (require/process/global/console/fetch/WebSocket).
//
// Le timeout du `vm.runInContext` coupe les boucles JS ; le pool termine le
// worker (timer de secours) pour les regex natives catastrophiques que le
// timeout vm ne peut pas interrompre.
// -----------------------------------------------------------------------------

const { parentPort } = require('worker_threads');
const vm = require('vm');
const unicode = require('unicode-encode');
const { createSecureContext, stripDangerousGlobals } = require('./secureContext.js');

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

// Helpers locaux (spécifiques à l'éval d'une expression) injectés EN PLUS du
// contexte sécurisé fourni par secureContext.js.
const localHelpers = {
  unicode,
  resolveString,
  escapeString,
  parseAndResolveString
};

stripDangerousGlobals();

parentPort.on('message', (msg) => {
  if (!msg || msg.type !== 'job') return;
  const { jobId, expression, variables, timeoutMs } = msg;

  // Contexte vm NEUF et SÉCURISÉ (libs épurées/gelées + import bloqué) par job.
  const ctx = createSecureContext();
  Object.assign(ctx, localHelpers);
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
