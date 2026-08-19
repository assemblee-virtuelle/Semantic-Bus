'use strict';

// -----------------------------------------------------------------------------
// validateExpression — validateur statique d'expressions JS utilisateur, exécuté
// AVANT le `eval` (modèle master).
//
// Objectif de sécurité : empêcher le code évalué d'accéder au système ou à des
// variables hors du scope contrôlé, tout en conservant la compatibilité avec les
// expressions de transformation existantes (accès aux libs de master exposées
// comme variables du scope : dayjs, moment, lodash, he, removeMarkdown, ...).
//
// Règles (inspirées des bonnes pratiques acorn/AST) :
//   - Identifiants système interdits : process, require, module, exports, global,
//     globalThis, Function, eval, console, Buffer, setImmediate, queueMicrotask,
//     window, self, fetch, XMLHttpRequest, WebAssembly, importScripts.
//   - Propriétés interdites (axes d'évasion) : constructor, __proto__, prototype,
//     mainModule, _load, _compile.
//   - `new` limité à une whitelist de constructeurs sûrs (Date, RegExp, Map, Set,
//     Error, ...) + ceux passés via options.newWhitelist (ObjectId, ...).
//   - Structure de code interdite : boucles, assignations, fonctions, classes,
//     imports, tagged templates, with, try/catch.
//   - Pas d'appels de fonction "nus" hors whitelist (ex. process(), require()).
//
// IMPORTANT : le validateur est une première ligne de défense. Il doit être
// associé à un scope d'évaluation contrôlé (le eval du transformateur master, où
// seules les variables voulues sont exposées, et jamais fs/path/crypto natifs).
// -----------------------------------------------------------------------------

const acorn = require('acorn');
const { LODASH_PROTO_POLLUTION_FUNCS } = require('./evalSecurity.js');

class ExpressionValidationError extends Error {}

// Identifiants dont l'accès est toujours interdit (accès au système / évasion).
// NB : `eval` et `Buffer` sont VOLONTAIREMENT absents de cette liste pour
// compatibilité avec la production (constructions `eval('new '+...)` de Date et
// `Buffer.from(...).toString('base64')`). La barrière de sécurité effective est
// le worker_threads isolé : il n'expose AUCUN module système (require/process/fs/
// child_process/... ne sont PAS sur le global du worker), donc un `eval` interne
// ne peut pas accéder au système — au pire à des libs sûres exposées (dayjs,
// crypto, he, ...). `crypto` est exposé (lib de prod). `process`/`require`/`fs`
// restent interdits ET non exposés.
const FORBIDDEN_IDENTIFIERS = new Set([
  'process', 'require', 'module', 'exports', 'global', 'globalThis',
  'Function', 'console', 'setImmediate', 'queueMicrotask',
  'window', 'self', 'fetch', 'XMLHttpRequest', 'WebAssembly', 'importScripts',
  // modules natifs Node (accessibles via require) — renforcé par précaution.
  'fs', 'path', 'child_process', 'os', 'net', 'http', 'https', 'tls',
  'worker_threads', 'dns', 'zlib', 'stream', 'util', 'events', 'url',
  'querystring', 'vm', 'cluster', 'readline', 'repl', 'dgram', 'http2', 'tty'
]);

// Noms de propriété dont l'accès est toujours interdit (gadgets d'évasion).
const FORBIDDEN_PROPERTIES = new Set([
  'constructor', '__proto__', 'prototype', 'mainModule', '_load', '_compile',
  'caller', 'arguments', 'callee'
]);

// Constructeurs autorisés pour `new` par défaut (sûrs).
const DEFAULT_NEW_WHITELIST = new Set([
  'Array', 'BigInt', 'Boolean', 'Date', 'Error', 'Map', 'Number', 'Object',
  'Promise', 'RegExp', 'Set', 'String', 'Symbol'
]);

// Appels de fonction "nus" autorisés : globals JS sûrs + fonctions utilitaires
// maîtrisées. (Les libs exposées par le scope du transformateur — dayjs, moment,
// removeMarkdown, ... — sont listées ici comme "bare calls" autorisés, car elles
// sont appelées comme dayjs(...) dans les expressions de production.)
const ALLOWED_BARE_CALLS = new Set([
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'decodeURI', 'decodeURIComponent',
  'encodeURI', 'encodeURIComponent', 'String', 'Number', 'Boolean', 'Array',
  'Object', 'Date', 'RegExp', 'JSON', 'Math',
  // libs / helpers exposés par le scope du transformateur (master) :
  'dayjs', 'moment', 'removeMarkdown', 'decodeUnicode', 'he', 'sanitizeHtml',
  // `eval` autorisé pour compat production (constructions `eval('new '+...)`),
  // la sécurité étant assurée par le worker isolé (require/process retirés du
  // global, timeout) — un eval ne peut pas accéder au système.
  'eval'
]);

/**
 * Détecte si le récepteur d'un member call est lodash/underscore (libs pouvant
 * effectuer une proto-pollution via merge/set/defaultsDeep/...).
 *
 * On remonte la chaîne de récepteurs : le call est bloqué si l'identifiant
 * racine est lodash/underscore/_, OU si une propriété de la chaîne s'appelle
 * `lodash` (ex. this.lodash.merge). Un `.update()` sur un objet Hash crypto
 * (récepteur = crypto.createHash()) n'est PAS lodash et reste autorisé.
 */
function isLodashReceptor(node) {
  let cur = node;
  const visited = new Set();
  while (cur && cur.type === 'MemberExpression' && !cur.computed && !visited.has(cur)) {
    visited.add(cur);
    if (cur.property && cur.property.type === 'Identifier' &&
        (cur.property.name === 'lodash' || cur.property.name === '_' || cur.property.name === 'underscore')) {
      return true;
    }
    cur = cur.object;
  }
  if (cur && cur.type === 'Identifier') {
    return cur.name === 'lodash' || cur.name === '_' || cur.name === 'underscore';
  }
  return false;
}

/**
 * Valide une expression JS avant évaluation. Lève ExpressionValidationError si
 * le code est inacceptable.
 *
 * @param {string} source code source à valider
 * @param {{newWhitelist?: string[], allowedCalls?: string[]}} [options]
 */
function validateExpression(source, options = {}) {
  const newWhitelist = options.newWhitelist || [];
  const allowedCalls = options.allowedCalls || [];
  const allowedNew = new Set([...DEFAULT_NEW_WHITELIST, ...newWhitelist]);

  let ast;
  try {
    ast = acorn.parse(source, { ecmaVersion: 2022 });
  } catch (e) {
    throw new ExpressionValidationError(`Invalid JS expression: ${e.message}`);
  }

  const stack = [ast];
  while (stack.length) {
    const node = stack.pop();

    // 1. Identifiants interdits
    if (node.type === 'Identifier') {
      if (FORBIDDEN_IDENTIFIERS.has(node.name)) {
        throw new ExpressionValidationError(`Forbidden identifier: ${node.name}`);
      }
    }

    // 2. Membre : propriété interdite (y compris via notation calcée)
    if (node.type === 'MemberExpression') {
      const prop = node.computed ? node.property.value : node.property && node.property.name;
      if (prop !== undefined && FORBIDDEN_PROPERTIES.has(prop)) {
        throw new ExpressionValidationError(`Forbidden property access: ${prop}`);
      }
      if (node.computed && node.property.type === 'Literal' &&
          typeof node.property.value === 'string' &&
          FORBIDDEN_PROPERTIES.has(node.property.value)) {
        throw new ExpressionValidationError(`Forbidden computed property: ${node.property.value}`);
      }
      if (node.property && node.property.type === 'PrivateIdentifier') {
        throw new ExpressionValidationError('Private members are forbidden');
      }
    }

    // 3. new : whitelist de constructeurs
    if (node.type === 'NewExpression') {
      let calleeName = null;
      if (node.callee.type === 'Identifier') {
        calleeName = node.callee.name;
      } else if (node.callee.type === 'MemberExpression' && !node.callee.computed &&
                 node.callee.property.type === 'Identifier') {
        calleeName = node.callee.property.name;
      }
      if (!calleeName || !allowedNew.has(calleeName)) {
        throw new ExpressionValidationError(`Forbidden constructor: new ${calleeName || '<dynamic>'}`);
      }
    }

    // 4. Structure : interdire tout ce qui crée du code / du contrôle de flux
    switch (node.type) {
    case 'ForStatement':
    case 'WhileStatement':
    case 'DoWhileStatement':
    case 'ForInStatement':
    case 'ForOfStatement':
      throw new ExpressionValidationError(`Loop construct forbidden: ${node.type}`);
    case 'UpdateExpression':
      throw new ExpressionValidationError('Update expression forbidden');
    case 'AssignmentExpression':
    case 'AssignmentPattern':
      throw new ExpressionValidationError('Assignment forbidden');
    case 'UnaryExpression':
      if (node.operator === 'delete' || node.operator === 'void') {
        throw new ExpressionValidationError(`Forbidden unary operator: ${node.operator}`);
      }
      break;
    case 'ImportDeclaration':
    case 'ExportNamedDeclaration':
    case 'ExportDefaultDeclaration':
    case 'ImportExpression':
      throw new ExpressionValidationError(`Import/export forbidden: ${node.type}`);
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ClassDeclaration':
    case 'ClassExpression':
      throw new ExpressionValidationError(`${node.type} forbidden: keep expressions declarative`);
    case 'ArrowFunctionExpression':
      // autorisées : .map(x => ...), .filter(...) — très utilisées en prod
      break;
    case 'VariableDeclaration':
      throw new ExpressionValidationError('Variable declaration forbidden');
    case 'WithStatement':
      throw new ExpressionValidationError('with statement forbidden');
    case 'TryStatement':
    case 'CatchClause':
      throw new ExpressionValidationError('try/catch forbidden');
    case 'TaggedTemplateExpression':
      throw new ExpressionValidationError('Tagged template forbidden');
    case 'CallExpression': {
      if (node.callee.type === 'Identifier' &&
            (FORBIDDEN_IDENTIFIERS.has(node.callee.name) ||
             !ALLOWED_BARE_CALLS.has(node.callee.name))) {
        if (!allowedCalls.includes(node.callee.name)) {
          throw new ExpressionValidationError(`Forbidden bare call: ${node.callee.name}`);
        }
      }
      if (node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          LODASH_PROTO_POLLUTION_FUNCS.has(node.callee.property.name) &&
          isLodashReceptor(node.callee.object)) {
        // bloque les appels type lodash.merge / _.set / _.defaultsDeep / ...
        // UNIQUEMENT si le récepteur racine est lodash/underscore (un `.update()`
        // sur un objet Hash crypto est légitime et ne doit PAS être bloqué).
        throw new ExpressionValidationError(`Forbidden prototype-polluting call: ${node.callee.property.name}`);
      }
      break;
    }
    default:
      break;
    }

    // Parcours récursif
    for (const key in node) {
      if (key === 'parent' || key === 'start' || key === 'end' || key === 'loc' || key === 'range') {
        continue;
      }
      const value = node[key];
      if (Array.isArray(value)) {
        for (const child of value) {
          if (child && typeof child.type === 'string') stack.push(child);
        }
      } else if (value && typeof value.type === 'string') {
        stack.push(value);
      }
    }
  }

  return ast;
}

module.exports = {
  validateExpression,
  ExpressionValidationError,
  FORBIDDEN_IDENTIFIERS,
  FORBIDDEN_PROPERTIES,
  DEFAULT_NEW_WHITELIST
};
