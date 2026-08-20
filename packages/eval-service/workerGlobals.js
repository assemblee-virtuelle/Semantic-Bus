'use strict';

// -----------------------------------------------------------------------------
// workerGlobals — retire du `globalThis` du worker les globals Node dangereux
// avant toute évaluation de code utilisateur (eval). Un worker_threads expose
// require/module/process/global/console ; sans nettoyage, un `eval('require("fs")')
// accéderait au système. `Buffer`/`crypto` sont conservés (usage de prod sûr).
// `fetch`/`WebSocket` sont aussi retirés (défense en profondeur : limiter l'egress).
// -----------------------------------------------------------------------------

const DANGEROUS_GLOBALS = ['require', 'module', 'process', 'global', 'console', 'fetch', 'WebSocket'];

function stripDangerousGlobals() {
  for (const name of DANGEROUS_GLOBALS) {
    try {
      delete globalThis[name];
    } catch (e) {
      try {
        Object.defineProperty(globalThis, name, { value: undefined, writable: false, configurable: false });
      } catch (e2) {
        // dernier recours : rien
      }
    }
  }
}

module.exports = { stripDangerousGlobals, DANGEROUS_GLOBALS };
