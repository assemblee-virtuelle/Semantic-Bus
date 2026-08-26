'use strict';

// -----------------------------------------------------------------------------
// Mock de evalSecurity pour les tests unitaires engine.
//
// En production, TOUTES les évaluations passent par le eval-service (container
// isolé, `runEvalInRemote` — appel HTTP signé). L'engine n'a AUCUNE méthode
// d'évaluation interne (plus de worker local). Pour les tests unitaires (sans
// container), `runEvalInRemote` est mocké pour reproduire EXACTEMENT ce que le
// container exécute : un contexte vm neuf construit par `secureContext.js`
// (eval-service) + injection des variables + `vm.runInContext` avec timeout —
// la même logique que `eval-service/evalWorker.js`.
// -----------------------------------------------------------------------------

const vm = require('vm');
const { createSecureContext } = require('../../../eval-service/secureContext.js');
const actual = jest.requireActual('../evalSecurity.js');

function evaluateInContainer(expression, variables = {}, timeoutMs = 10000) {
  const ctx = createSecureContext();
  if (variables) Object.assign(ctx, variables);
  return vm.runInContext(expression, ctx, { timeout: timeoutMs });
}

module.exports = {
  ...actual,
  async runEvalInRemote(expression, variables = {}, timeoutMs = 10000) {
    try {
      return evaluateInContainer(expression, variables, timeoutMs);
    } catch (e) {
      throw new Error(e && e.message ? e.message : String(e));
    }
  }
};