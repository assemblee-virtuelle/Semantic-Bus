'use strict';

// -----------------------------------------------------------------------------
// whereWorker (eval-service) — worker_threads PERSISTANT qui évalue une
// condition $where sur un ensemble d'items (pool de workers, workerPool.js).
//
// `obj` est l'item courant ; la condition a été validée par validateExpression
// à l'extérieur et `this` y est déjà réécrit en `obj`.
//
// Un contexte vm par JOB (pas par item : coût négligeable, expression simple)
// garantit qu'aucun état ne transite d'un job $where à l'autre.
// -----------------------------------------------------------------------------

const { parentPort } = require('worker_threads');
const vm = require('vm');
const { stripDangerousGlobals } = require('./workerGlobals.js');

stripDangerousGlobals();

parentPort.on('message', (msg) => {
  if (!msg || msg.type !== 'job') return;
  const { jobId, expression, items, timeoutMs } = msg;

  const ctx = vm.createContext({});
  ctx.Buffer = Buffer;

  try {
    const matches = [];
    for (let i = 0; i < items.length; i++) {
      ctx.obj = items[i];
      // eslint-disable-next-line no-eval
      const evaluation = vm.runInContext(expression, ctx, { timeout: timeoutMs });
      if (evaluation == true) matches.push(i);
    }
    parentPort.postMessage({ type: 'result', jobId, ok: true, matches });
  } catch (e) {
    parentPort.postMessage({
      type: 'result',
      jobId,
      ok: false,
      error: e && e.message ? e.message : String(e)
    });
  }
});