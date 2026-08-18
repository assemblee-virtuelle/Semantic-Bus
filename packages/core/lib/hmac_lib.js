'use strict';

// -----------------------------------------------------------------------------
// hmac_lib — signature HMAC-SHA256 des appels internes aux endpoints d'exécution.
//
// But : authentifier les callers légitimes de `POST /engine/work-ask/:componentId`
// (le seul caller HTTP actif est le timer scheduler interne, workspace_lib
// `_executeAllTimers`). Un attaquant anonyme sans le secret ne peut plus déclencher
// un workflow / fournir du pushData sans signature valide.
//
// La signature est calculée sur `componentId.timestamp.<corps canonique>` et est
// liée au corps (bind) : toute altération du corps invalide la signature.
// -----------------------------------------------------------------------------

const crypto = require('crypto');
const getConfiguration = require('../getConfiguration.js');
const config = getConfiguration() || { secret: 'test-secret-for-testing' };

const HMAC_HEADER = 'x-engine-signature';
const HMAC_TIMESTAMP_HEADER = 'x-engine-timestamp';
const MAX_AGE_MS = 5 * 60 * 1000; // 5 min : anti-replay

/**
 * Secret HMAC dédié aux appels d'exécution. Priorité :
 * 1. env `ENGINE_HMAC_SECRET` (permet au eval-service isolé, sans config montée,
 *    de partager le secret avec l'engine) ;
 * 2. `config.engineHmacSecret` ;
 * 3. `config.secret`.
 */
function secret() {
  return process.env.ENGINE_HMAC_SECRET || config.engineHmacSecret || config.secret;
}

/**
 * Sérialisation canonique d'un objet JSON (clés triées) pour un calcul de
 * signature déterministe indépendant de l'ordre des clés / des espaces.
 */
function canonicalStringify(value) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalStringify).join(',') + ']';
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return '{' + keys.map(k =>
      JSON.stringify(k) + ':' + canonicalStringify(value[k])
    ).join(',') + '}';
  }
  return JSON.stringify(value);
}

/**
 * Calcule la signature HMAC d'un appel.
 * @param {string} componentId identifiant du composant ciblé
 * @param {Object} body corps de la requête (sera canoniquement sérialisé)
 * @param {number} [timestamp=Date.now()] timestamp (ms) — lié à l'appel
 * @returns {{signature: string, timestamp: number}}
 */
function sign(componentId, body, timestamp) {
  const ts = timestamp || Date.now();
  // Normalisation JSON : les valeurs bson (ObjectId mongo...) deviennent leur
  // représentation sérialisée (hex). Le vérificateur reçoit toujours le corps
  // après un aller-retour JSON (requête HTTP ou message AMQP), donc la
  // signature doit être calculée sur cette forme normalisée — sinon le
  // canonicalStringify d'un ObjectId (`{}`, propriétés non énumérables) ne
  // correspond jamais à la valeur hex reçue côté vérification.
  const rawBody = body == null ? {} : body;
  const normalizedBody = JSON.parse(JSON.stringify(rawBody));
  const message = `${String(componentId)}.${ts}.${canonicalStringify(normalizedBody)}`;
  const signature = crypto.createHmac('sha256', secret()).update(message).digest('hex');
  return { signature, timestamp: ts };
}

/**
 * Vérifie la signature d'une requête Express. Retourne true si valide.
 * @param {string} componentId
 * @param {Object} body
 * @param {Object} headers headers de la requête
 * @returns {boolean}
 */
function verify(componentId, body, headers) {
  const signature = headers[HMAC_HEADER];
  const timestamp = headers[HMAC_TIMESTAMP_HEADER];
  if (!signature || !timestamp) return false;

  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() - ts) > MAX_AGE_MS) return false;

  const message = `${componentId}.${ts}.${canonicalStringify(body || {})}`;
  const expected = crypto.createHmac('sha256', secret()).update(message).digest('hex');

  const a = Buffer.from(String(expected));
  const b = Buffer.from(String(signature));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Champs injectés dans un message AMQP/STOMP pour authentifier un caller interne.
const HMAC_MSG_SIGNATURE = 'signature';
const HMAC_MSG_TIMESTAMP = 'timestamp';
const HMAC_MSG_SIGNER = 'signedBy'; // 'hmac' pour distinguer d'un message JWT

/**
 * Signe un message destiné à être publié sur la file `work-ask` (caller interne).
 * Ajoute `signature`/`timestamp`/`signedBy` au message.
 * @param {string} componentId identifiant du composant ciblé
 * @param {Object} body contenu métier du message (sans les champs de signature)
 * @param {number} [timestamp]
 * @returns {Object} le message avec les champs de signature
 */
function signMessage(componentId, body, timestamp) {
  const { signature, timestamp: ts } = sign(componentId, body, timestamp);
  return Object.assign({}, body, {
    [HMAC_MSG_SIGNATURE]: signature,
    [HMAC_MSG_TIMESTAMP]: ts,
    [HMAC_MSG_SIGNER]: 'hmac'
  });
}

/**
 * Vérifie un message `work-ask` signé par un caller interne (HMAC).
 * Le message doit contenir `signature`, `timestamp`, `id` (composant).
 * @param {Object} message message AMQP/STOMP reçu
 * @returns {boolean}
 */
function verifyMessage(message) {
  if (!message || !message.id) return false;
  const signature = message[HMAC_MSG_SIGNATURE];
  const timestamp = message[HMAC_MSG_TIMESTAMP];
  if (!signature || !timestamp || message[HMAC_MSG_SIGNER] !== 'hmac') return false;

  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() - ts) > MAX_AGE_MS) return false;

  // Le corps signé est le message SANS les champs de signature.
  const body = {};
  for (const key of Object.keys(message)) {
    if (key !== HMAC_MSG_SIGNATURE && key !== HMAC_MSG_TIMESTAMP && key !== HMAC_MSG_SIGNER) {
      body[key] = message[key];
    }
  }

  const signed = `${message.id}.${ts}.${canonicalStringify(body)}`;
  const expected = crypto.createHmac('sha256', secret()).update(signed).digest('hex');
  const a = Buffer.from(String(expected));
  const b = Buffer.from(String(signature));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  sign,
  verify,
  signMessage,
  verifyMessage,
  secret,
  canonicalStringify,
  HMAC_HEADER,
  HMAC_TIMESTAMP_HEADER,
  HMAC_MSG_SIGNATURE,
  HMAC_MSG_TIMESTAMP,
  HMAC_MSG_SIGNER,
  MAX_AGE_MS
};
