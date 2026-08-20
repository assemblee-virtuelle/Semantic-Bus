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
const hmac_lib = require('@semantic-bus/core/lib/hmac_lib');
const { WorkerPool } = require('./workerPool.js');

const app = express();
// Corps reçu en OCTETS BRUTS (Buffer). La signature HMAC est calculée sur ces
// mêmes octets (signBuffer/verifyBuffer) : pas de re-sérialisation canonique.
// On ne parse JSON qu'APRÈS vérification de la signature.
app.use(express.raw({ type: 'application/json', limit: '10mb' }));

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
// Recyclage des workers (sécurité) : nombre de jobs par worker avant remplacement.
// Défaut 1 (le plus sûr) — une éval malveillante ne persiste pas au-delà d'un job.
const EVAL_RECYCLE_AFTER = Number(process.env.EVAL_RECYCLE_AFTER || 1);

const evalPool = new WorkerPool({ script: 'evalWorker.js', size: EVAL_POOL_SIZE, recycleAfter: EVAL_RECYCLE_AFTER });
const wherePool = new WorkerPool({ script: 'whereWorker.js', size: WHERE_POOL_SIZE, recycleAfter: EVAL_RECYCLE_AFTER });

// Arrêt propre : termine les workers au signal SIGTERM (docker stop).
process.on('SIGTERM', () => {
  evalPool.close();
  wherePool.close();
  process.exit(0);
});

// Lit un corps brut signé (Buffer), vérifie la signature sur ces octets puis
// parse le JSON. Retourne `null` si la signature est invalide.
function readSignedBody(req, res) {
  if (!hmac_lib.verifyBuffer(SIGN_COMPONENT, req.body, req.headers)) {
    res.status(401).send({ ok: false, error: 'Unauthorized: missing or invalid signature' });
    return null;
  }
  try {
    return JSON.parse(req.body.toString('utf8') || '{}');
  } catch (e) {
    res.status(400).send({ ok: false, error: 'Invalid JSON body' });
    return null;
  }
}

app.post('/eval', async (req, res) => {
  const body = readSignedBody(req, res);
  if (body === null) return;

  // 2. Validation du body (lisible et simple).
  const { expression, variables } = body;
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
  const timeoutMs = (body && body.timeoutMs) ? Number(body.timeoutMs) : DEFAULT_TIMEOUT_MS;

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
  const body = readSignedBody(req, res);
  if (body === null) return;

  const { expression, items } = body;
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
  const timeoutMs = (body && body.timeoutMs) ? Number(body.timeoutMs) : DEFAULT_TIMEOUT_MS;

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
