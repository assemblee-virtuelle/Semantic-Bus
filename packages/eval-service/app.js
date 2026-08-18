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
// Chaque évaluation est exécutée dans un worker_threads INTERNE terminable
// (timeout) : un DoS (boucle, ReDoS, allocation mémoire) est contenu dans ce
// container isolé (pas d'accès réseau aux autres services, pas de variables
// système de l'engine, limites CPU/mémoire docker).
// -----------------------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Worker } = require('worker_threads');
const hmac_lib = require('@semantic-bus/core/lib/hmac_lib');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Identifiant "composant" utilisé pour la signature HMAC de ce service.
const SIGN_COMPONENT = 'eval';
// Timeout par défaut d'une évaluation (ms).
const DEFAULT_TIMEOUT_MS = Number(process.env.EVAL_TIMEOUT_MS || 10000);
// Longueur max d'expression.
const MAX_EXPRESSION_LENGTH = 20000;

/**
 * Exécute une expression dans un worker_threads terminable (timeout).
 * @param {string} expression
 * @param {Object} variables
 * @param {number} timeoutMs
 * @returns {Promise<*>}
 */
function runEvalInWorker(expression, variables, timeoutMs) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'evalWorker.js'), {
      workerData: { expression, variables }
    });
    let settled = false;
    const settle = (fn, val) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(val);
    };
    const timer = setTimeout(() => {
      worker.terminate();
      settle(reject, new Error(`eval timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    worker.on('message', (msg) => {
      if (msg && msg.ok === true) settle(resolve, msg.result);
      else settle(reject, new Error((msg && msg.error) || 'unknown eval error'));
    });
    worker.on('error', (err) => settle(reject, err));
    worker.on('exit', (code) => {
      if (code !== 0 && !settled) settle(reject, new Error(`eval worker exited with code ${code}`));
    });
  });
}

function runWhereInWorker(expression, items, timeoutMs) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'whereWorker.js'), {
      workerData: { expression, items }
    });
    let settled = false;
    const settle = (fn, val) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(val);
    };
    const timer = setTimeout(() => {
      worker.terminate();
      settle(reject, new Error(`where timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    worker.on('message', (msg) => {
      if (msg && msg.ok === true) settle(resolve, msg.matches);
      else settle(reject, new Error((msg && msg.error) || 'unknown where error'));
    });
    worker.on('error', (err) => settle(reject, err));
    worker.on('exit', (code) => {
      if (code !== 0 && !settled) settle(reject, new Error(`where worker exited with code ${code}`));
    });
  });
}

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

  // 3. Évaluation dans un worker interne terminable.
  try {
    const result = await runEvalInWorker(expression, variables || {}, timeoutMs);
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
    const matches = await runWhereInWorker(expression, items, timeoutMs);
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
