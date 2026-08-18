'use strict';

// -----------------------------------------------------------------------------
// specificDataValidator — validation / sanitisation du `specificData` des
// composants à l'ÉCRITURE (création & mise à jour).
//
// Le schéma Mongoose stocke `specificData` comme `{type: Object}` sans aucune
// validation (workspace_component_schema). C'est le vecteur d'entrée des
// expressions évaluées par l'engine. En plus de la validation AST à l'exécution
// (validateExpression) et de la sanitisation des valeurs injectées
// (evalSecurity.sanitizeValue), on refroidit le `specificData` dès la
// persistance :
//   - interdit les clés dangereuses (__proto__, constructor, prototype) ->
//     prototype pollution à l'écriture ;
//   - retire les getters / prototypes "vivants" -> aucune lecture ne déclenche
//     de code caché ;
//   - borne la profondeur / la taille (anti-bombement).
//
// Défense en profondeur : un acteur autorisé à écrire ne peut pas injecter de
// clé de pollution ni de getter dans la configuration persistée.
// -----------------------------------------------------------------------------

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const MAX_DEPTH = 100;
const MAX_ITEMS = 100000;

function sanitizeSpecificData(value, depth = 0) {
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t !== 'object') {
    // primitives / fonctions : on garde les primitives, on refuse les fonctions
    if (t === 'function') return undefined;
    return value;
  }
  if (depth > MAX_DEPTH) return {};

  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (Array.isArray(value)) {
    if (value.length > MAX_ITEMS) return [];
    const out = new Array(value.length);
    for (let i = 0; i < value.length; i++) {
      out[i] = sanitizeSpecificData(value[i], depth + 1);
    }
    return out;
  }

  const out = {};
  let count = 0;
  const ownNames = Object.getOwnPropertyNames(value);
  for (const key of ownNames) {
    if (DANGEROUS_KEYS.has(key)) continue; // clé d'attaque ignorée
    let descriptor;
    try {
      descriptor = Object.getOwnPropertyDescriptor(value, key);
    } catch (e) {
      continue;
    }
    if (descriptor && 'value' in descriptor) {
      if (count >= MAX_ITEMS) break;
      out[key] = sanitizeSpecificData(descriptor.value, depth + 1);
      count++;
    }
    // accessor (getter) : ignoré — on ne déclenche pas de lecture
  }
  return out;
}

/**
 * Valide et assainit le specificData d'un composant avant persistance.
 * Retourne le specificData nettoyé (objet plat, sans clés dangereuses ni
 * getters). Si l'entrée n'est pas un objet, retourne {}.
 */
function validateSpecificData(specificData) {
  if (specificData === undefined || specificData === null) return {};
  if (typeof specificData !== 'object' || Array.isArray(specificData)) {
    return {};
  }
  return sanitizeSpecificData(specificData);
}

module.exports = { validateSpecificData, sanitizeSpecificData };
