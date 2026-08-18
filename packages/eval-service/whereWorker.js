'use strict';

// -----------------------------------------------------------------------------
// whereWorker (eval-service) — évalue une condition $where sur un ensemble
// d'items dans un worker_threads terminable (DoS contenu dans le container).
//
// `obj` est l'item courant ; la condition a été validée par validateExpression
// à l'extérieur et `this` y est déjà réécrit en `obj`.
// -----------------------------------------------------------------------------

const { parentPort, workerData } = require('worker_threads');
const { stripDangerousGlobals } = require('./workerGlobals.js');

const { expression, items } = workerData;

stripDangerousGlobals();

let result;
try {
  const matches = [];
  for (let i = 0; i < items.length; i++) {
    const obj = items[i];
    // eslint-disable-next-line no-eval
    const evaluation = eval(expression);
    if (evaluation == true) matches.push(i);
  }
  result = matches;
} catch (e) {
  parentPort.postMessage({ ok: false, error: e && e.message ? e.message : String(e) });
  return;
}

parentPort.postMessage({ ok: true, matches: result });
