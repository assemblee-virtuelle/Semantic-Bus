'use strict';

// -----------------------------------------------------------------------------
// eval-service — service d'évaluation JavaScript isolé en container.
//
// API HTTP signée (HMAC) dédiée UNIQUEMENT à l'évaluation d'expressions JS des
// transformations / $where de Semantic-Bus. La résolution des valeurs ($/£) est
// faite À L'EXTÉRIEUR (par l'engine) : ce service ne reçoit que l'expression
// épurée + un objet `variables` séparé.
//
// Body d'appel (POST /eval) :
//   {
//     "expression": "dayjs(vDate).add(1,'day').format('YYYY-MM-DD')",
//     "variables":  { "vDate": "2020-01-01" }
//   }
//
// Réponse :
//   { "ok": true, "result": "2020-01-02" }  |  { "ok": false, "error": "..." }
//
// Chaque évaluation est exécutée dans un pool de worker_threads PERSISTANTS :
// un DoS (boucle, ReDoS, allocation mémoire) est contenu dans ce container
// isolé (pas d'accès réseau aux autres services, pas de variables système de
// l'engine, limites CPU/mémoire docker). Les workers sont créés au boot et
// traitent les jobs par message ; chacun exécute chaque job dans un contexte
// vm neuf (aucun état ne transite entre deux évaluations).
// -----------------------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
const hmac_lib = require('@semantic-bus/core/lib/hmac_lib');
const { WorkerPool } = require('./workerPool.js');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Identifiant "composant" utilisé pour la signature HMAC de ce service.
const SIGN_COMPONENT = 'eval';
// Timeout par défaut d'une évaluation (ms).
const DEFAULT_TIMEOUT_MS = Number(process.env.EVAL_TIMEOUT_MS || 10000);
// Longueur max d'expression.
const MAX_EXPRESSION_LENGTH = 20000;

// Pools de workers : tailles configurables par env (défauts raisonnables).
const EVAL_POOL_SIZE = Number(process.env.EVAL_POOL_SIZE || 4);
const WHERE_POOL_SIZE = Number(process.env.WHERE_POOL_SIZE || 2);
const EVAL_MAX_QUEUE = Number(process.env.EVAL_MAX_QUEUE || 200);

const evalPool = new WorkerPool({ script: 'evalWorker.js', size: EVAL_POOL_SIZE });
const wherePool = new WorkerPool({ script: 'whereWorker.js', size: WHERE_POOL_SIZE });

// Arrêt propre : termine les workers au signal SIGTERM (docker stop).
process.on('SIGTERM', () => {
  evalPool.close();
  wherePool.close();
  process.exit(0);
});

app.post('/eval', async (req, res) => {
  // 1. Vérification de la signature HMAC (body + timestamp).
  if (!hmac_lib.verify(SIGN_COMPONENT, req.body, req.headers)) {
    res.status(401).send({ ok: false, error: 'Unauthorized: missing or invalid signature' });
    return;
  }

  // 2. Validation du body (lisible et simple).
  const { expression, variables } = req.body || {};
  if (typeof expression !== 'string' || expression.length === 0) {
    res.status(400).send({ ok: false, error: 'expression (string) is required' });
    return;
  }
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    res.status(400).send({ ok: false, error: `expression too long (max ${MAX_EXPRESSION_LENGTH})` });
    return;
  }
  if (variables !== undefined && (typeof variables !== 'object' || variables === null || Array.isArray(variables))) {
    res.status(400).send({ ok: false, error: 'variables must be an object' });
    return;
  }
  const timeoutMs = (req.body && req.body.timeoutMs) ? Number(req.body.timeoutMs) : DEFAULT_TIMEOUT_MS;

  // 3. Évaluation dans un worker du pool (contexte vm neuf par job).
  try {
    const result = await evalPool.exec({ expression, variables: variables || {}, timeoutMs }, timeoutMs, EVAL_MAX_QUEUE);
    res.send({ ok: true, result });
  } catch (e) {
    res.status(200).send({ ok: false, error: e && e.message ? e.message : String(e) });
  }
});

// -----------------------------------------------------------------------------
// POST /where — évalue une condition $where sur un ensemble d'items.
// Body :
//   { "expression": "obj.age >= 18", "items": [ {...}, ... ] }
// Réponse : { "ok": true, "matches": [0, 2] }  |  { "ok": false, "error": "..." }
// -----------------------------------------------------------------------------
app.post('/where', async (req, res) => {
  if (!hmac_lib.verify(SIGN_COMPONENT, req.body, req.headers)) {
    res.status(401).send({ ok: false, error: 'Unauthorized: missing or invalid signature' });
    return;
  }

  const { expression, items } = req.body || {};
  if (typeof expression !== 'string' || expression.length === 0) {
    res.status(400).send({ ok: false, error: 'expression (string) is required' });
    return;
  }
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    res.status(400).send({ ok: false, error: `expression too long (max ${MAX_EXPRESSION_LENGTH})` });
    return;
  }
  if (!Array.isArray(items)) {
    res.status(400).send({ ok: false, error: 'items must be an array' });
    return;
  }
  const timeoutMs = (req.body && req.body.timeoutMs) ? Number(req.body.timeoutMs) : DEFAULT_TIMEOUT_MS;

  try {
    const matches = await wherePool.exec({ expression, items, timeoutMs }, timeoutMs, EVAL_MAX_QUEUE);
    res.send({ ok: true, matches });
  } catch (e) {
    res.status(200).send({ ok: false, error: e && e.message ? e.message : String(e) });
  }
});

app.get('/health', (req, res) => res.send({ ok: true }));

const port = process.env.APP_PORT || 8083;
app.listen(port, () => {
  console.log('✅ eval-service listening on port', port);
});
