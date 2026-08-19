'use strict';

// -----------------------------------------------------------------------------
// rateLimiter — limitation de débit en mémoire, par IP (anti-DoS).
//
// Utilisé pour protéger les endpoints publics d'exécution (`/data/api/*` du
// httpProvider) contre les abus / déni de service tout en laissant l'API publique.
//
// Simple et sans dépendance : compteur par adresse IP dans une Map, fenêtre
// glissante, éviction périodique des entrées inactives pour éviter les fuites.
//
// ⚠️ LIMITE IMPORTANTE : le compteur est EN MÉMOIRE (par process). Ce rate-limit
// n'est pleinement efficace qu'en déploiement MONO-INSTANCE. En multi-replica,
// chaque instance possède son propre compteur : le quota effectif est multiplié
// par le nombre de replicas et l'anti-DoS perd de son efficacité. Pour un
// déploiement scalable, il faut un store partagé (Redis/DB).
// -----------------------------------------------------------------------------

const config = require('../../config.json');

// Limites configurables (valeurs par défaut raisonnables). Surpassées par
// l'environnement / config si renseignées.
const MAX_REQUESTS = Number(config.apiRateLimitMax || process.env.API_RATE_LIMIT_MAX || 300);
const WINDOW_MS = Number(config.apiRateLimitWindowMs || process.env.API_RATE_LIMIT_WINDOW_MS || 60000);

const hits = new Map();

// Éviction périodique des compteurs inactifs.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) {
    if (now - entry.resetAt > WINDOW_MS * 2) {
      hits.delete(ip);
    }
  }
}, WINDOW_MS).unref();

/**
 * Middleware Express : rejette 429 si l'IP dépasse le quota dans la fenêtre.
 */
function rateLimitByIp(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();

  let entry = hits.get(ip);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    hits.set(ip, entry);
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    res.status(429).send('Too Many Requests');
    return;
  }
  next();
}

module.exports = { rateLimitByIp, MAX_REQUESTS, WINDOW_MS };
