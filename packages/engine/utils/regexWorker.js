'use strict';

// -----------------------------------------------------------------------------
// regexWorker — exécute une opération RegExp (matchAll) dans un worker_threads
// TERMINABLE (point 3/ReDoS). Un motif catastrophique (backtracking exponentiel)
// ne peut pas bloquer indéfiniment le process engine : le thread principal le
// termine au bout du délai via worker.terminate().
// -----------------------------------------------------------------------------

const { parentPort, workerData } = require('worker_threads');

const { pattern, flags, input } = workerData;

let result;
try {
  const re = new RegExp(pattern, flags);
  // Reproduit le comportement de regex.js : chaque match retourne ses groupes
  // (sans l'index 0 = correspondance complète).
  result = [...input.matchAll(re)].map(r => r.splice(1));
} catch (e) {
  parentPort.postMessage({ ok: false, error: e && e.message ? e.message : String(e) });
  return;
}

parentPort.postMessage({ ok: true, result });
