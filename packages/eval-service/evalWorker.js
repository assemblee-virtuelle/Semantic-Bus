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
const { createSecureContext, stripDangerousGlobals } = require('./secureContext.js');

stripDangerousGlobals();

parentPort.on('message', (msg) => {
  if (!msg || msg.type !== 'job') return;
  const { jobId, expression, variables, timeoutMs } = msg;

  // Contexte vm NEUF et SÉCURISÉ (libs épurées/gelées + import bloqué) par job.
  const ctx = createSecureContext();
  // CONTRAT DE SÉCURITÉ : les `variables` injectées dans le scope sont considérées
  // SÛRES à la SEULE condition qu'elles aient transité par `runEvalInRemote`
  // (engine), qui applique `sanitizeValue` (retrait des clés __proto__/constructor/
  // prototype + des accessors/getters) avant la sérialisation HTTP — c'est le point
  // d'application unique côté engine (voir evalSecurity.js). Ce container est INTERNE
  // (non exposé, signé HMAC, appelable uniquement par l'application) : ne pas appeler
  // /eval avec des variables non assainies et ne pas exposer ce port hors du réseau
  // interne. Tout nouveau chemin d'entrée DOIT passer par runEvalInRemote.
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
