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
const { LODASH_PROTO_POLLUTION_FUNCS, LODASH_CODE_EXECUTION_FUNCS } = require('./evalSecurity.js');

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

// -----------------------------------------------------------------------------
// WHITELIST par lib exposée (objets importés dans le scope eval).
// Une formule `lib.methode()` n'est autorisée que si `methode` figure dans la
// whitelist de `lib`. Stratégie WHITELIST (permettre explicitement) plutôt que
// blacklist (retirer une liste) : toute nouvelle méthode doit être ajoutée ici,
// ce qui passe par une revue (PR) et garantit qu'aucune fonction compilant du
// code host-realm (comme lodash.template) ne peut être appelée.
// Ces whitelists doivent rester COHÉRENTES avec secureContext.js (eval-service) :
// TOUTE lib exposée dans le scope eval (makeHelpers) DOIT figurer ici, sinon ses
// méthodes échappent au contrôle (voir SB-RCE-2026-01, review 2026-08-24).
// -----------------------------------------------------------------------------
const LIB_METHOD_WHITELISTS = {
  // Alias lodash/underscore
  lodash: new Set([
    'truncate', 'map', 'filter', 'get', 'has', 'keys', 'values', 'omit', 'pick',
    'clone', 'cloneDeep', 'isEqual', 'isArray', 'isObject', 'isString', 'isNumber',
    'isBoolean', 'isNil', 'isEmpty', 'toLower', 'toUpper', 'trim', 'replace', 'split',
    'join', 'slice', 'find', 'findIndex', 'includes', 'reduce', 'each', 'forEach',
    'flatMap', 'uniq', 'groupBy', 'orderBy', 'sortBy', 'findLast', 'head', 'last',
    'first', 'size', 'range', 'fill', 'reverse', 'concat', 'flatten', 'flattenDeep',
    'compact', 'take', 'drop', 'chunk', 'zip', 'unzip', 'max', 'min', 'sum', 'mean',
    'round', 'ceil', 'floor', 'parseInt', 'parseFloat', 'escape', 'unescape', 'capitalize',
    'startsWith', 'endsWith', 'padStart', 'padEnd', 'repeat', 'toInteger', 'toNumber',
    'toString', 'identity', 'property', 'matches', 'constant'
  ]),
  _: null, // alias -> voir lodash ci-dessous (géré par getReceptorLib)
  underscore: null, // alias -> voir lodash
  he: new Set(['decode', 'encode']),
  dayjs: new Set(['unix', 'utc', 'locale', 'isDayjs', 'duration', 'max', 'min']),
  moment: new Set(['utc', 'unix', 'locale', 'duration', 'min', 'max', 'now', 'isMoment']),
  Buffer: new Set(['from']),
  crypto: new Set(['createHash', 'randomUUID', 'randomBytes']),
  // --- Libs/helpers exposés par makeHelpers (secureContext.js) mais hors whitelist
  // --- auparavant (SB-RCE-2026-01, point 2 du chercheur). Cohérence validateur ↔ scope.
  cheerio: new Set(['load']), // seul point d'entrée de parse DOM (pattern prod)
  dotProp: new Set(['get', 'has', 'delete']), // `set` bloqué (proto-pollution, via whitelist)
  sanitizeHtml: new Set(), // appel nu uniquement
  removeMarkdown: new Set(), // appel nu uniquement
  decodeUnicode: new Set(), // appel nu uniquement
  // ---------------------------------------------------------------------------
  // JS INTRINSICS GLOBAUX — WHITELIST STRICTE (plus aucun "par défaut autorisé").
  // Les built-ins d'introspection (Reflect, Proxy, Object.getPrototypeOf,
  // Object.getOwnPropertyDescriptor, ...) sont ABSENTS ou en whitelist VIDE :
  // tout accès membre est bloqué. C'est ce qui neutralise le vecteur
  // "nom de propriété dangereux passé en ARGUMENT string" (SB-RCE-2026-01,
  // au-delà des points du chercheur) : Reflect.get(he.decode,'constructor')
  // est désormais rejeté.
  // ---------------------------------------------------------------------------
  Object: new Set(['keys', 'values', 'entries', 'assign', 'create', 'fromEntries', 'is', 'hasOwn']),
  Math: new Set([
    'round', 'floor', 'ceil', 'abs', 'max', 'min', 'pow', 'sqrt', 'cbrt', 'trunc',
    'sign', 'random', 'hypot', 'log', 'log2', 'log10', 'log1p', 'exp', 'expm1',
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh',
    'asinh', 'acosh', 'atanh', 'clamp', 'fround', 'imul',
    'PI', 'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'SQRT2', 'SQRT1_2'
  ]),
  JSON: new Set(['parse', 'stringify']),
  Array: new Set(['isArray', 'from', 'of']),
  String: new Set(['fromCharCode', 'fromCodePoint', 'raw']),
  Number: new Set([
    'isInteger', 'isFinite', 'isNaN', 'isSafeInteger', 'parseFloat', 'parseInt',
    'MAX_SAFE_INTEGER', 'MIN_SAFE_INTEGER', 'MAX_VALUE', 'MIN_VALUE', 'EPSILON',
    'POSITIVE_INFINITY', 'NEGATIVE_INFINITY', 'NaN'
  ]),
  Date: new Set(['now', 'parse', 'UTC']),
  Symbol: new Set(['for', 'keyFor']),
  // Utilisables via `new` (DEFAULT_NEW_WHITELIST) ou appel nu ; membres statiques
  // TOUS bloqués par défaut (whitelist vide).
  Boolean: new Set(),
  BigInt: new Set(),
  RegExp: new Set(),
  Map: new Set(),
  Set: new Set(),
  WeakMap: new Set(),
  WeakSet: new Set(),
  ArrayBuffer: new Set(),
  SharedArrayBuffer: new Set(),
  DataView: new Set(),
  Atomics: new Set(),
  Promise: new Set(),
  Error: new Set(),
  AggregateError: new Set(),
  EvalError: new Set(),
  RangeError: new Set(),
  ReferenceError: new Set(),
  SyntaxError: new Set(),
  TypeError: new Set(),
  URIError: new Set(),
  Int8Array: new Set(),
  Uint8Array: new Set(),
  Uint8ClampedArray: new Set(),
  Int16Array: new Set(),
  Uint16Array: new Set(),
  Int32Array: new Set(),
  Uint32Array: new Set(),
  Float32Array: new Set(),
  Float64Array: new Set(),
  BigInt64Array: new Set(),
  BigUint64Array: new Set(),
  Intl: new Set(),
  FinalizationRegistry: new Set(),
  WeakRef: new Set(),
  Reflect: new Set(), // introspection -> TOUT bloqué
  Proxy: new Set() // constructeur d'interposition -> TOUT bloqué
};

// -----------------------------------------------------------------------------
// WHITELIST des MÉTHODES sur les OBJETS PRODUITS par les libs exposées.
// Une lib autorisée ne donne accès qu'aux méthodes de ses objets produits qui
// figurent explicitement ici (stratégie 100% WHITELIST — plus aucune blacklist).
// Le type de l'objet produit est inféré statiquement de la chaîne d'appels
// (voir exprType). Les résultats de type "data" (strings/tableaux/objets plats
// produits par he.decode, lodash.*, les variables du flux, ...) ne sont PAS
// restreints ici : leurs méthodes natives ne sont pas des surfaces d'API de lib,
// et le seul vecteur d'évasion (constructor/__proto__/prototype) est bloqué par
// FORBIDDEN_PROPERTIES + le constant-folding.
// -----------------------------------------------------------------------------
const PRODUCED_WHITELISTS = {
  dayjsInstance: new Set([
    'format', 'add', 'subtract', 'diff', 'startOf', 'endOf', 'get', 'set', 'unix',
    'valueOf', 'toISOString', 'toDate', 'toJSON', 'toArray', 'toString', 'isBefore',
    'isAfter', 'isSame', 'isSameOrBefore', 'isSameOrAfter', 'isValid', 'isDayjs',
    'year', 'month', 'date', 'day', 'dayOfYear', 'week', 'isoWeek', 'hour', 'minute',
    'second', 'millisecond', 'daysInMonth', 'utcOffset', 'local', 'utc', 'clone'
  ]),
  momentInstance: new Set([
    'format', 'add', 'subtract', 'diff', 'startOf', 'endOf', 'get', 'set', 'unix',
    'valueOf', 'toISOString', 'toDate', 'toJSON', 'toString', 'isBefore', 'isAfter',
    'isSame', 'isSameOrBefore', 'isSameOrAfter', 'isValid', 'isMoment', 'year',
    'month', 'date', 'day', 'dayOfYear', 'week', 'isoWeek', 'hour', 'minute',
    'second', 'millisecond', 'daysInMonth', 'utcOffset', 'local', 'utc', 'clone',
    'fromNow', 'calendar'
  ]),
  cheerioInstance: new Set([
    'text', 'html', 'map', 'get', 'each', 'find', 'filter', 'first', 'last', 'eq',
    'attr', 'removeAttr', 'addClass', 'removeClass', 'hasClass', 'prop', 'removeProp',
    'val', 'data', 'removeData', 'next', 'nextAll', 'prev', 'prevAll', 'parent',
    'parents', 'parentsUntil', 'closest', 'children', 'contents', 'siblings',
    'toArray', 'serialize', 'serializeArray', 'is', 'not', 'has', 'add', 'slice',
    'end', 'append', 'prepend', 'after', 'before', 'remove', 'empty', 'clone',
    'wrap', 'unwrap', 'css', 'replaceWith', 'length'
  ]),
  // `cheerio.load(...)` retourne la fonction de sélection (`$`) ; ses méthodes
  // et l'instance produite partagent la même surface d'API.
  cheerioCallable: new Set([
    'text', 'html', 'map', 'get', 'each', 'find', 'filter', 'first', 'last', 'eq',
    'attr', 'prop', 'val', 'data', 'toArray', 'serialize', 'is', 'not', 'has',
    'add', 'slice', 'end', 'clone', 'length'
  ]),
  hash: new Set(['update', 'digest']),
  bufferResult: new Set(['toString'])
};

// Méthodes statiques d'une lib dont l'appel PRODUIT une instance (ex. dayjs.utc).
const DATE_STATIC_PRODUCING = new Set(['utc', 'unix']);
// Méthodes d'une instance date qui renvoient une instance du même type (chaînage).
const DATE_INSTANCE_PRODUCING = new Set(['add', 'subtract', 'startOf', 'endOf', 'set', 'utc', 'local', 'clone']);
// Méthodes d'un objet cheerio qui renvoient un objet cheerio (chaînage).
const CHEERIO_INSTANCE_PRODUCING = new Set([
  'map', 'find', 'filter', 'first', 'last', 'eq', 'slice', 'add', 'not', 'has',
  'end', 'parent', 'parents', 'closest', 'children', 'siblings', 'next', 'prev',
  'nextAll', 'prevAll', 'clone', 'append', 'prepend', 'after', 'before', 'wrap', 'unwrap'
]);

/**
 * Infère statiquement le type d'une expression (mini type-system dédié au
 * validateur), pour appliquer PRODUCED_WHITELISTS aux objets produits par les
 * libs exposées. Types : libs ('dayjs', 'he', ...), objets produits
 * ('dayjsInstance', 'cheerioInstance', 'hash', 'bufferResult', ...), 'this',
 * 'data' (données/variables, non restreint) ou `undefined` (inconnu).
 */
function exprType(node) {
  if (!node) return undefined;
  switch (node.type) {
  case 'Identifier': {
    if (LIB_METHOD_WHITELISTS[node.name] !== undefined) return node.name;
    return undefined; // variable du flux (v0, obj, source, key, ...) : non restreinte
  }
  case 'ThisExpression':
    return 'this';
  case 'Literal':
    return 'data';
  case 'CallExpression': {
    const calleeType = exprType(node.callee);
    switch (calleeType) {
    case 'dayjs': return 'dayjsInstance';
    case 'moment': return 'momentInstance';
    case 'cheerioLoad': return 'cheerioCallable';
    case 'cheerioCallable':
    case 'cheerioInstance':
      return 'cheerioInstance';
    case 'dayjsInstance':
    case 'momentInstance':
    case 'hash':
    case 'bufferResult':
      return calleeType;
    default:
      return 'data';
    }
  }
  case 'MemberExpression': {
    const objType = exprType(node.object);
    const meth = node.computed ? foldStaticValue(node.property) : node.property && node.property.name;
    // `this.moment` / `this.dayjs` / ... : membre d'accès sur `this` = la lib.
    if (objType === 'this' && typeof meth === 'string' && LIB_METHOD_WHITELISTS[meth] !== undefined) {
      return meth;
    }
    if (typeof meth !== 'string') return 'data';
    if (objType === 'dayjs' || objType === 'moment') {
      return DATE_STATIC_PRODUCING.has(meth) ? (objType === 'dayjs' ? 'dayjsInstance' : 'momentInstance') : 'data';
    }
    if (objType === 'cheerio') return meth === 'load' ? 'cheerioLoad' : 'data';
    if (objType === 'crypto') return meth === 'createHash' ? 'hash' : 'data';
    if (objType === 'Buffer') return meth === 'from' ? 'bufferResult' : 'data';
    if (objType === 'dayjsInstance' || objType === 'momentInstance') {
      return DATE_INSTANCE_PRODUCING.has(meth) ? objType : 'data';
    }
    if (objType === 'cheerioInstance' || objType === 'cheerioCallable' || objType === 'cheerioLoad') {
      return CHEERIO_INSTANCE_PRODUCING.has(meth) ? 'cheerioInstance' : 'data';
    }
    if (objType === 'hash') return meth === 'update' ? 'hash' : 'data';
    return 'data';
  }
  default:
    return 'data';
  }
}

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
/**
 * Identifie si le récepteur racine d'un appel de méthode est une de nos libs
 * exposées (lodash/_, he, dayjs, moment, Buffer, crypto) et retourne son nom
 * canonical. Retourne null si ce n'est pas une lib exposée (ex. un tableau, un
 * objet de données, ou un objet retourné par dayjs()/cheerio()).
 */
function getReceptorLib(node) {
  // remonte la chaîne de MemberExpression jusqu'à l'identifiant racine
  let cur = node;
  const visited = new Set();
  while (cur && cur.type === 'MemberExpression' && !cur.computed && !visited.has(cur)) {
    visited.add(cur);
    cur = cur.object;
  }
  if (cur && cur.type === 'Identifier') {
    const name = cur.name;
    if (name === '_' || name === 'underscore') return 'lodash';
    // Toute lib exposée OU tout JS intrinsic global : si whitelist absente/vide
    // (Reflect, Proxy, introspection...), tout accès membre sera bloqué.
    if (LIB_METHOD_WHITELISTS[name] !== undefined) return name;
  }
  return null;
}

// Maintient isLodashReceptor (utilisé plus bas) en se basant sur getReceptorLib.
function isLodashReceptor(node) {
  return getReceptorLib(node) === 'lodash';
}

/**
 * Constant-folding d'une clé computed : résout statiquement une expression de
 * clé composée uniquement de constantes (littéraux, concaténations, templates
 * sans interpolation). Retourne `undefined` si la clé n'est pas statiquement
 * résolvable (variable dynamique, appel, ...).
 *
 * Objectif sécurité : une clé computed non-littérale comme `'con'+'structor'`
 * (BinaryExpression) n'a pas de `.value`, ce qui faisait sauter les gardes
 * `prop !== undefined` (FORBIDDEN_PROPERTIES / whitelist / blacklist) — voir
 * SB-RCE-2026-01 (review chercheur 2026-08-24). En repliant la clé, le résultat
 * (`'constructor'`) passe dans les mêmes contrôles que les clés littérales.
 *
 * Le cas non résolu (clé dynamique, ex. `obj[key]`) reste autorisé : il n'est
 * fermable que par un garde runtime (contenu par l'isolation du worker).
 */
function foldStaticValue(node) {
  if (!node) return undefined;
  if (node.type === 'Literal') return node.value;
  if (node.type === 'TemplateLiteral') {
    // Replie les templates dont toutes les interpolations sont statiquement
    // résolubles : `con${''}structor` -> 'constructor'. Si une interpolation
    // est dynamique (variable), on ne peut pas replier.
    const parts = [];
    for (let i = 0; i < node.quasis.length; i++) {
      parts.push(node.quasis[i].value.cooked ?? '');
      if (i < node.expressions.length) {
        const v = foldStaticValue(node.expressions[i]);
        if (v === undefined) return undefined;
        parts.push(String(v));
      }
    }
    return parts.join('');
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = foldStaticValue(node.left);
    const right = foldStaticValue(node.right);
    if (left !== undefined && right !== undefined) return String(left) + String(right);
  }
  return undefined;
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
      // Constant-folding des clés computed statiquement résolubles : une clé
      // non-littérale (`'con'+'structor'`) est repliée vers sa valeur afin de
      // passer par les mêmes contrôles que les clés littérales.
      const prop = node.computed ? foldStaticValue(node.property) : node.property && node.property.name;
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
      // WHITELIST par lib exposée (accès de propriété, ex. `lodash.template`,
      // `he.decode`, `dayjs.utc`). Si le récepteur est une lib exposée, la
      // propriété accédée doit être dans la whitelist de cette lib.
      const lib = getReceptorLib(node.object);
      if (lib && prop !== undefined && typeof prop === 'string') {
        const whitelist = LIB_METHOD_WHITELISTS[lib];
        if (!whitelist || !whitelist.has(prop)) {
          throw new ExpressionValidationError(`Forbidden method on ${lib}: ${prop}`);
        }
      }
      // WHITELIST des objets PRODUITS par les libs exposées (ex. dayjs(x).format,
      // cheerio.load(x)(sel).text(), crypto.createHash().digest()). Le type du
      // récepteur est inféré statiquement ; toute méthode non listée est interdite.
      const producedType = exprType(node.object);
      const producedWhitelist = PRODUCED_WHITELISTS[producedType];
      if (producedWhitelist && prop !== undefined && typeof prop === 'string' && !producedWhitelist.has(prop)) {
        throw new ExpressionValidationError(`Forbidden method on ${producedType}: ${prop}`);
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
          node.callee.property.type === 'Identifier') {
        // WHITELIST par lib exposée sur les APPELS de méthode : `lib.methode()`.
        // La méthode doit figurer dans la whitelist de la lib. Couvre à la fois
        // la proto-pollution (lodash.merge/_.set), la compilation de code
        // host-realm (lodash.template) et toute autre méthode non autorisée.
        // (Les méthodes sur objets produits sont contrôlées au niveau du
        // MemberExpression — voir PRODUCED_WHITELISTS.)
        const lib = getReceptorLib(node.callee.object);
        if (lib) {
          const whitelist = LIB_METHOD_WHITELISTS[lib];
          const meth = node.callee.property.name;
          if (!whitelist || !whitelist.has(meth)) {
            throw new ExpressionValidationError(`Forbidden method call on ${lib}: ${meth}`);
          }
        }
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
