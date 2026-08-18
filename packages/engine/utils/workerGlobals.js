'use strict';

// -----------------------------------------------------------------------------
// workerGlobals — nettoyage du scope global d'un worker_threads avant toute
// évaluation de code utilisateur (eval / $where).
//
// Un worker_threads expose sur `globalThis` des globals Node dangereux pour une
// évaluation de code arbitraire : `require`, `module`, `process`, `global`,
// `console`. Sans nettoyage, un `eval('require("fs")...')` dans l'expression d'un
// utilisateur accéderait au système (RCE). On les RETIRE donc du global du
// worker : le `eval` interne ne peut alors plus atteindre `require`/`process`/fs.
//
// `Buffer` est conservé (usage de production sûr : Buffer.from(...).toString()).
// `crypto` est exposé séparément (référence maîtrisée) par evalWorker.js.
// -----------------------------------------------------------------------------

const DANGEROUS_GLOBALS = ['require', 'module', 'process', 'global', 'console'];

/**
 * Retire les globals Node dangereux du `globalThis` du worker courant.
 * Idempotent. À appeler AVANT toute évaluation de code utilisateur.
 */
function stripDangerousGlobals() {
  for (const name of DANGEROUS_GLOBALS) {
    try {
      // configurable pour process/global ; delete sur require/module peut échouer
      // silencieusement selon la version de Node, d'où le try/catch.
      delete globalThis[name];
    } catch (e) {
      // ignore : si la propriété n'est pas supprimable, on tente une redéfinition
      try {
        Object.defineProperty(globalThis, name, { value: undefined, writable: false, configurable: false });
      } catch (e2) {
        // dernier recours : rien (le validateur + le scope maîtrisé restent)
      }
    }
  }
}

module.exports = { stripDangerousGlobals, DANGEROUS_GLOBALS };
