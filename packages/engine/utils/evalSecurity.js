'use strict';

// -----------------------------------------------------------------------------
// evalSecurity — durcissement de l'exécution d'expressions évaluées par eval().
//
// Points couverts :
//   2. Interdiction des clés "dangereuses" (__proto__, constructor, prototype)
//      dans les DONNÉES injectées (prototype pollution) + fonctions lodash
//      typées pollution.
//   3. Timeout strict de l'exécution (DoS par ReDoS / boucle déguisée).
//   4. Nettoyage des getters dans les données injectées (accès propriété ne
//      doit pas déclencher du code caché), de manière performante.
// -----------------------------------------------------------------------------

const path = require('path');
const { Worker } = require('worker_threads');
const fetch = require('node-fetch');
const hmac_lib = require('@semantic-bus/core/lib/hmac_lib');

// URL du service d'évaluation isolé (container). Configurable via env.
const EVAL_SERVICE_URL = process.env.EVAL_SERVICE_URL || 'http://eval-service:8083';
// Identifiant "composant" utilisé pour signer les appels au eval-service.
const EVAL_SIGN_COMPONENT = 'eval';
// Timeout HTTP par défaut vers le eval-service.
const EVAL_HTTP_TIMEOUT_MS = Number(process.env.EVAL_HTTP_TIMEOUT_MS || 15000);

// Clés dont la présence dans les données injectées est une tentative d'attaque
// (prototype pollution / pollution de chaîne de prototypes).
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Fonctions lodash qui effectuent de la pollution de prototype (via merge/set)
// quand une clé dangereuse est présente dans la valeur.
const LODASH_PROTO_POLLUTION_FUNCS = new Set([
  'merge', 'mergeWith', 'defaultsDeep', 'set', 'setWith', 'assign', 'defaults',
  'update', 'updateWith', 'zipObjectDeep', 'transform', 'create'
]);

/**
 * Clone une valeur en profondeur SANS getters ni prototypes « vivants », et en
 * filtrant les clés dangereuses (points 2 + 4).
 *
 * Objectif : avant d'injecter une valeur du flux dans une expression, la
 * « refroidir » pour que :
 *   - aucune clé __proto__/constructor/prototype ne puisse provoquer une
 *     pollution de prototype (point 2) ;
 *   - aucun getter n'exécute de code à la lecture (point 4) ;
 *   - le prototype héritant ne contienne pas de méthodes polluées.
 *
 * Implémentation : on lit chaque propriété via Object.getOwnPropertyNames et on
 * n'en recopie QUE les valeurs (data descriptors), en ignorant les accessors
 * (getters). On fabrique des objets plats. Les tableaux sont reconstruits.
 * Les Date/RegExp sont préservés (utiles pour dayjs/moment).
 */
function sanitizeValue(value, depth = 0, maxDepth = 100) {
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t !== 'object') {
    return value; // primitives : renvoyées telles (safe)
  }
  if (depth > maxDepth) {
    // sécurité anti-bombement : on coupe la profondeur
    if (Array.isArray(value)) return value.map((v) => sanitizeValue(v, depth + 1, maxDepth));
    return {};
  }

  // Date / RegExp : instances utiles pour dayjs/moment
  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (Array.isArray(value)) {
    const out = new Array(value.length);
    for (let i = 0; i < value.length; i++) {
      out[i] = sanitizeValue(value[i], depth + 1, maxDepth);
    }
    return out;
  }

  const out = {};
  const ownNames = Object.getOwnPropertyNames(value);
  for (const key of ownNames) {
    if (DANGEROUS_KEYS.has(key)) {
      // clé d'attaque : on ne la recopie pas (point 2)
      continue;
    }
    try {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor && 'value' in descriptor) {
        // data descriptor : valeur directe (on ne déclenche pas d'accessor)
        out[key] = sanitizeValue(descriptor.value, depth + 1, maxDepth);
      }
      // accessor (getter) : on ignore la clé (point 4) — pas de lecture
    } catch (e) {
      // accessor qui lève : on ignore
    }
  }
  return out;
}

/**
 * Exécute `fn()` (contenant le eval) avec un timeout strict.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Promise<*>}
 */
function evalWithTimeout(fn, ms = 10000) {
  return new Promise((resolve, reject) => {
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error(`Expression evaluation timed out after ${ms}ms`));
      }
    }, ms);
    try {
      const result = fn();
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(result);
      }
    } catch (e) {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        reject(e);
      }
    }
  });
}

/**
 * Exécute `expression` (évaluée par eval) dans un worker_threads TERMINABLE,
 * avec un timeout strict (point 3).
 *
 * Contrairement à `evalWithTimeout`, un eval exécuté ici peut être réellement
 * interrompu : si le délai est dépassé, le worker est terminé via
 * `worker.terminate()` (un eval synchrone dans le thread principal bloquerait le
 * event loop et ne pourrait pas être interrompu par un simple setTimeout).
 *
 * En bonus, le code évalué tourne dans un thread isolé : il n'accède PAS aux
 * variables / modules du process principal (défense en profondeur).
 *
 * @param {string} expression code source à évaluer (scope master exposé dans le worker)
 * @param {Object} [scope] variables additionnelles exposées au code évalué (sécurisées)
 * @param {number} [timeoutMs=10000] délai maximal d'exécution
 * @returns {Promise<*>} le résultat du eval (structured clone via postMessage)
 */
function runEvalInWorker(expression, scope = {}, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'evalWorker.js'), {
      workerData: { expression, scope }
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
      settle(reject, new Error(`Expression evaluation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    worker.on('message', (msg) => {
      if (msg && msg.ok === true) {
        settle(resolve, msg.result);
      } else {
        settle(reject, new Error((msg && msg.error) || 'Unknown eval error'));
      }
    });
    worker.on('error', (err) => settle(reject, err));
    worker.on('exit', (code) => {
      if (code !== 0 && !settled) {
        settle(reject, new Error(`Eval worker exited with code ${code}`));
      }
    });
  });
}

// Limites anti-ReDoS appliquées à l'opération RegExp (point 3) :
// longueur max du motif et de la chaîne d'entrée, timeout d'exécution.
const MAX_REGEX_PATTERN_LENGTH = 2048;
const MAX_REGEX_INPUT_LENGTH = 10 * 1024 * 1024; // 10 MB
const REGEX_DEFAULT_TIMEOUT_MS = 2000;

/**
 * Exécute `input.matchAll(new RegExp(pattern, flags))` dans un worker_threads
 * TERMINABLE, avec limites de longueur et timeout (anti-ReDoS).
 *
 * @param {string} pattern motif (fourni par l'utilisateur via specificData.regex)
 * @param {string} flags drapeaux regex (ex. 'gm')
 * @param {string} input chaîne sur laquelle appliquer le motif
 * @param {number} [timeoutMs=2000] délai maximal avant terminaison du worker
 * @returns {Promise<Array<Array<string>>>} les groupes capturés de chaque match
 */
function runRegexInWorker(pattern, flags, input, timeoutMs = REGEX_DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    if (typeof pattern !== 'string' || pattern.length > MAX_REGEX_PATTERN_LENGTH) {
      reject(new Error(`Regex pattern too long or invalid (max ${MAX_REGEX_PATTERN_LENGTH} chars)`));
      return;
    }
    if (typeof input !== 'string') {
      reject(new Error('Regex input must be a string'));
      return;
    }
    if (input.length > MAX_REGEX_INPUT_LENGTH) {
      reject(new Error(`Regex input too large (max ${MAX_REGEX_INPUT_LENGTH} chars)`));
      return;
    }

    const worker = new Worker(path.join(__dirname, 'regexWorker.js'), {
      workerData: { pattern, flags: flags || '', input }
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
      settle(reject, new Error(`Regex execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    worker.on('message', (msg) => {
      if (msg && msg.ok === true) {
        settle(resolve, msg.result);
      } else {
        settle(reject, new Error((msg && msg.error) || 'Unknown regex error'));
      }
    });
    worker.on('error', (err) => settle(reject, err));
    worker.on('exit', (code) => {
      if (code !== 0 && !settled) {
        settle(reject, new Error(`Regex worker exited with code ${code}`));
      }
    });
  });
}

// Nombre max d'items traités par un appel $where (anti-bombement).
const MAX_WHERE_ITEMS = 100000;

/**
 * Évalue une condition `$where` (expression JS utilisateur, validée par
 * validateExpression) sur un ensemble d'items dans un worker_threads TERMINABLE
 * (protection ReDoS/DoS, cohérente avec runEvalInWorker / runRegexInWorker).
 *
 * @param {string} expression condition $where (déjà validée, `this`→`obj`)
 * @param {Array<*>} items items à évaluer (obj = item courant)
 * @param {number} [timeoutMs=2000] délai maximal avant terminaison du worker
 * @returns {Promise<Array<number>>} indices des items matchant `== true`
 */
function runWhereInWorker(expression, items, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(items)) {
      reject(new Error('$where items must be an array'));
      return;
    }
    if (items.length > MAX_WHERE_ITEMS) {
      reject(new Error(`$where too many items (max ${MAX_WHERE_ITEMS})`));
      return;
    }

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
      settle(reject, new Error(`$where evaluation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    worker.on('message', (msg) => {
      if (msg && msg.ok === true) {
        settle(resolve, msg.matches);
      } else {
        settle(reject, new Error((msg && msg.error) || 'Unknown $where error'));
      }
    });
    worker.on('error', (err) => settle(reject, err));
    worker.on('exit', (code) => {
      if (code !== 0 && !settled) {
        settle(reject, new Error(`$where worker exited with code ${code}`));
      }
    });
  });
}

/**
 * POST signé (HMAC) vers le eval-service (container d'évaluation isolé).
 * Pas de fallback : si le service n'est pas joignable (timeout HTTP), on lève.
 * @param {string} route '/eval' ou '/where'
 * @param {Object} body corps lisible { expression, variables | items, timeoutMs }
 * @param {number} httpTimeoutMs
 * @param {string} [resultKey='result'] champ du résultat dans la réponse —
 *   `/eval` répond `{ ok:true, result }`, `/where` répond `{ ok:true, matches }`.
 * @returns {Promise<*>} le résultat (déjà désérialisé)
 */
async function postEval(route, body, httpTimeoutMs, resultKey = 'result') {
  const { signature, timestamp } = hmac_lib.sign(EVAL_SIGN_COMPONENT, body);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), httpTimeoutMs);
  try {
    const res = await fetch(EVAL_SERVICE_URL + route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [hmac_lib.HMAC_HEADER]: signature,
        [hmac_lib.HMAC_TIMESTAMP_HEADER]: timestamp
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!res.ok) {
      throw new Error(`eval-service HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || 'eval-service error');
    }
    return data[resultKey];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Évalue une expression dans le eval-service (container isolé).
 * La résolution des valeurs ($/£) est faite AVANT (par l'appelant) : on envoie
 * l'expression épurée + un objet `variables` séparé.
 * @param {string} expression expression JS (déjà résolue, sans {$..}/{£..})
 * @param {Object} [variables] variables exposées dans le scope (résolues à l'extérieur)
 * @param {number} [timeoutMs] timeout d'exécution côté service
 * @returns {Promise<*>} résultat de l'évaluation
 */
async function runEvalInRemote(expression, variables = {}, timeoutMs = 10000) {
  return postEval('/eval', { expression, variables, timeoutMs }, EVAL_HTTP_TIMEOUT_MS);
}

/**
 * Évalue une condition $where sur un ensemble d'items dans le eval-service.
 * @param {string} expression condition $where (validée, `this`→`obj`)
 * @param {Array<*>} items items à évaluer
 * @param {number} [timeoutMs] timeout d'exécution côté service
 * @returns {Promise<Array<number>>} indices des items matchant
 */
async function runWhereInRemote(expression, items, timeoutMs = 2000) {
  return postEval('/where', { expression, items, timeoutMs }, EVAL_HTTP_TIMEOUT_MS, 'matches');
}

module.exports = {
  sanitizeValue,
  evalWithTimeout,
  runEvalInWorker,
  runRegexInWorker,
  runWhereInWorker,
  runEvalInRemote,
  runWhereInRemote,
  DANGEROUS_KEYS,
  LODASH_PROTO_POLLUTION_FUNCS
};
