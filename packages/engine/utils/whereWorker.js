'use strict';

// -----------------------------------------------------------------------------
// whereWorker — évalue une condition $where (expression JS utilisateur) sur un
// ensemble d'items dans un worker_threads TERMINABLE (protection ReDoS/DoS).
//
// Le callback `collection.where(fn)` de Loki s'exécute de façon synchrone par
// item dans le process principal : une regex catastrophique dans $where pouvait
// geler l'engine sans timeout. Ici, on évalue la condition dans un worker
// terminable (timeout), comme pour le transformateur et le composant regex.
//
// `obj` est l'item courant (la condition $where est validée par validateExpression
// AVANT d'arriver ici, et `this` y est déjà réécrit en `obj`).
// -----------------------------------------------------------------------------

const { parentPort, workerData } = require('worker_threads');
const { stripDangerousGlobals } = require('./workerGlobals.js');

const { expression, items } = workerData;

// SÉCURITÉ : retire require/module/process/global/console du global du worker
// avant l'évaluation, pour qu'un `eval` dans une condition $where ne puisse pas
// accéder au système.
stripDangerousGlobals();

let result;
try {
  // Évaluation par item : direct eval pour que `obj` (variable de closure) soit
  // visible par l'expression. L'expression a été validée par validateExpression.
  const matches = [];
  for (let i = 0; i < items.length; i++) {
    const obj = items[i];
    // eslint-disable-next-line no-eval
    const evaluation = eval(expression);
    if (evaluation == true) {
      matches.push(i);
    }
  }
  result = matches;
} catch (e) {
  parentPort.postMessage({ ok: false, error: e && e.message ? e.message : String(e) });
  return;
}

parentPort.postMessage({ ok: true, matches: result });
