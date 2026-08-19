'use strict';

// -----------------------------------------------------------------------------
// Mock de evalSecurity pour les tests unitaires.
//
// En production, les évals sont exécutées dans le eval-service (container isolé,
// via `runEvalInRemote`/`runWhereInRemote` — appel HTTP signé, pas de fallback).
// Pour les tests unitaires (sans container), on réutilise le worker_threads local
// (`runEvalInWorker`/`runWhereInWorker`) comme moteur de référence : même logique
// d'évaluation, sans dépendance réseau.
// -----------------------------------------------------------------------------

const actual = jest.requireActual('../evalSecurity.js');

module.exports = {
  ...actual,
  runEvalInRemote: actual.runEvalInWorker,
  runWhereInRemote: actual.runWhereInWorker
};
