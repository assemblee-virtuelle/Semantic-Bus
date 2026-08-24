'use strict';

// -----------------------------------------------------------------------------
// engineWorkAuth — autorisation des messages `work-ask` consommés par l'engine.
//
// Un message `work-ask` (AMQP/STOMP) contient un JWT (`token`) émis pour un
// utilisateur. Avant d'exécuter le composant ciblé, l'engine vérifie que :
//   1. le JWT est valide (signature + non expiré) ;
//   2. le composant ciblé existe ;
//   3. l'utilisateur (iss du JWT) est admin, OU a un rôle owner/editor sur le
//      workspace auquel appartient le composant.
//
// Cela empêche un détenteur de credentials STOMP (même légitime) de déclencher
// l'exécution d'un workflow auquel il n'a pas accès.
// -----------------------------------------------------------------------------

const jwt = require('jwt-simple');
const getConfiguration = require('../getConfiguration.js');
const user_lib = require('./user_lib.js');
const workspace_component_lib = require('./workspace_component_lib.js');

// Config de l'engine (getConfiguration tombe sur @semantic-bus/engine/config.json
// dans le container engine). On évite auth_lib.js qui tire passport/Google
// (google_auth_strategy exige ../../main/config.json, absent du container engine).
// Fallback sûr (même convention que hmac_lib) : en CI/unit, getConfiguration peut
// retourner undefined (workspace réduit sans main/engine/timer) — on ne doit pas
// crasher sur config.secret.
const config = getConfiguration() || {};

// Rôles autorisés à déclencher l'exécution d'un composant.
const ALLOWED_ROLES = new Set(['owner', 'editor']);

/**
 * Vérifie le token JWT et retourne l'identifiant utilisateur (iss) ou null.
 * @param {string} token token JWT (brut, sans préfixe)
 * @returns {string|null} userID ou null si invalide/expiré
 */
function getUserFromToken(token) {
  if (!token || typeof token !== 'string') return null;
  let decoded;
  try {
    decoded = jwt.decode(token, config.secret);
  } catch {
    return null;
  }
  if (!decoded || !decoded.iss) return null;
  if (!decoded.exp || new Date(decoded.exp * 1000) < Date.now()) return null;
  return decoded.iss;
}

/**
 * Vérifie que l'utilisateur a le droit d'exécuter le composant `componentId`.
 * @param {string} token JWT de l'appelant
 * @param {string} componentId identifiant du composant ciblé
 * @param {Object} config configuration (secret, adminUsers)
 * @returns {Promise<{authorized: boolean, reason?: string}>}
 */
async function authorizeWorkAsk(token, componentId, config) {
  const userId = getUserFromToken(token);
  if (!userId) {
    return { authorized: false, reason: 'invalid or expired token' };
  }

  let component;
  try {
    component = await workspace_component_lib.get({ _id: componentId });
  } catch {
    return { authorized: false, reason: 'component not found' };
  }
  if (!component || !component.workspaceId) {
    return { authorized: false, reason: 'component not found' };
  }
  const workspaceId = component.workspaceId.toString();

  let user;
  try {
    user = await user_lib.getWithRelations(userId, config);
  } catch {
    return { authorized: false, reason: 'user not found' };
  }

  // Admin : liste explicite config.adminUsers OU statut admin persisté en base
  // (bootstrap admin : premier utilisateur créé sur une instance vide, quand
  // adminUsers n'est pas configuré). getWithRelations ne renvoie plus admin=true
  // par défaut pour tout le monde ; on s'y fie donc pour le statut persisté.
  const adminList = config && config.adminUsers
    ? (Array.isArray(config.adminUsers) ? config.adminUsers : [config.adminUsers])
    : [];
  if (user && user.credentials && user.credentials.email &&
      (adminList.includes(user.credentials.email) || user.admin === true)) {
    return { authorized: true };
  }

  const member = (user && user.workspaces || []).find(w =>
    w.workspace && w.workspace._id && w.workspace._id.toString() === workspaceId
  );
  if (member && ALLOWED_ROLES.has(member.role)) {
    return { authorized: true };
  }

  return { authorized: false, reason: 'not a member of the component workspace' };
}

module.exports = { authorizeWorkAsk, getUserFromToken, ALLOWED_ROLES };
