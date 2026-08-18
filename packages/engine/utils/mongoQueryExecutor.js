'use strict';

// -----------------------------------------------------------------------------
// mongoQueryExecutor — exécution sécurisée des requêtes Mongo saisies par
// l'utilisateur (composant "Connecteur Mongo", champ `querySelect`).
//
// L'ancien code faisait `eval('collection.' + querySelect)`, ce qui permettait
// d'exécuter du JS arbitraire. Ici on NE fait AUCUN eval : on parse la chaîne
// de requête et on n'autorise qu'un sous-ensemble très restreint :
//
//   collection.METHODE(argsJSON).METHODE(argsJSON)...
//
//   - METHODE   ∈ whitelist (find, findOne, sort, limit, skip, count,
//               countDocuments, distinct, aggregate, toArray, project, ...)
//   - argsJSON  = littéraux JSON uniquement (objets, tableaux, strings,
//               nombres, booléens, null). Aucun identifiant, aucune fonction,
//               aucune expression.
//
// La validation se fait SUR LA CHAÎNE FINALE, APRÈS interpolation par
// stringReplacer (les valeurs {£.x}/{$.y} peuvent provenir de sources
// anonymes) — c'est le seul moment où l'on peut être sûr de ce qui sera
// exécuté.
// -----------------------------------------------------------------------------

const ALLOWED_METHODS = new Set([
  'find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete',
  'findOneAndReplace', 'findOneAndRemove',
  'sort', 'limit', 'skip', 'count', 'countDocuments', 'countDocumentsEstimate',
  'distinct', 'aggregate', 'project', 'toArray', 'pretty',
  'updateOne', 'updateMany', 'insertOne', 'insertMany',
  'deleteOne', 'deleteMany', 'replaceOne', 'forEach'
]);

// Correspondance méthode -> rend un cursor ou un document/promise
// (pour savoir si on doit `.toArray()` à la fin).
const CURSOR_METHODS = new Set([
  'find', 'aggregate'
]);

class MongoQueryValidationError extends Error {}

/**
 * Parse une chaîne de requête Mongo (`find({...}).sort(...).limit(5)`) en une
 * liste d'étapes exécutables. Lève MongoQueryValidationError si la chaîne ne
 * respecte pas la grammaire stricte.
 *
 * @returns {Array<{method: string, args: any[]}>}
 */
function parseQuery(queryString) {
  const source = queryString.trim();
  if (!source) {
    throw new MongoQueryValidationError('Empty query');
  }

  const steps = [];
  let pos = 0;

  const skipWhitespace = () => {
    while (pos < source.length && /\s/.test(source[pos])) pos++;
  };

  const expectChar = (ch) => {
    skipWhitespace();
    if (source[pos] !== ch) {
      throw new MongoQueryValidationError(`Expected '${ch}' at position ${pos}, got '${source[pos] || 'end of string'}'`);
    }
    pos++;
  };

  const parseIdentifier = () => {
    skipWhitespace();
    const match = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(source.slice(pos));
    if (!match) {
      throw new MongoQueryValidationError(`Expected method name at position ${pos}`);
    }
    pos += match[0].length;
    return match[0];
  };

  const parseLiteral = (depth = 0) => {
    if (depth > 64) {
      throw new MongoQueryValidationError('Query nesting too deep');
    }
    skipWhitespace();
    const c = source[pos];
    if (c === '{') {
      pos++;
      const obj = {};
      skipWhitespace();
      if (source[pos] === '}') { pos++; return obj; }
      while (pos < source.length) {
        skipWhitespace();
        const keyMatch = /^"([^"\\]|\\.)*"/.exec(source.slice(pos)) || /^'([^'\\]|\\.)*'/.exec(source.slice(pos)) || /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(source.slice(pos));
        if (!keyMatch) {
          throw new MongoQueryValidationError(`Expected object key at position ${pos}`);
        }
        let key = keyMatch[0];
        try {
          key = JSON.parse(key);
        } catch (e) {
          // identifiant nu : utilisé tel quel
        }
        pos += keyMatch[0].length;
        skipWhitespace();
        if (source[pos] !== ':') {
          throw new MongoQueryValidationError(`Expected ':' at position ${pos}`);
        }
        pos++;
        obj[key] = parseLiteral(depth + 1);
        skipWhitespace();
        if (source[pos] === ',') { pos++; continue; }
        if (source[pos] === '}') { pos++; break; }
        throw new MongoQueryValidationError(`Expected ',' or '}' at position ${pos}`);
      }
      if (pos >= source.length) {
        throw new MongoQueryValidationError('Unterminated object literal');
      }
      return obj;
    } else if (c === '[') {
      pos++;
      const arr = [];
      skipWhitespace();
      if (source[pos] === ']') { pos++; return arr; }
      while (pos < source.length) {
        arr.push(parseLiteral(depth + 1));
        skipWhitespace();
        if (source[pos] === ',') { pos++; continue; }
        if (source[pos] === ']') { pos++; break; }
        throw new MongoQueryValidationError(`Expected ',' or ']' at position ${pos}`);
      }
      if (pos >= source.length) {
        throw new MongoQueryValidationError('Unterminated array literal');
      }
      return arr;
    } else if (c === '"' || c === "'") {
      const quote = c;
      pos++;
      let out = '';
      while (pos < source.length) {
        const ch = source[pos];
        if (ch === '\\') {
          pos++;
          if (pos >= source.length) break;
          out += source[pos];
          pos++;
        } else if (ch === quote) {
          pos++;
          return out;
        } else {
          out += ch;
          pos++;
        }
      }
      throw new MongoQueryValidationError('Unterminated string literal');
    } else if (c >= '0' && c <= '9' || c === '-') {
      const numMatch = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(source.slice(pos));
      if (!numMatch) {
        throw new MongoQueryValidationError(`Invalid number at position ${pos}`);
      }
      pos += numMatch[0].length;
      return Number(numMatch[0]);
    } else if (source.startsWith('true', pos)) { pos += 4; return true; }
    else if (source.startsWith('false', pos)) { pos += 5; return false; }
    else if (source.startsWith('null', pos)) { pos += 4; return null; }
    else if (source.startsWith('undefined', pos)) { pos += 9; return undefined; }
    throw new MongoQueryValidationError(`Unexpected token at position ${pos}: '${source.slice(pos, pos + 20)}'`);
  };

  // Structure attendue : METHODE(args).METHODE(args)...
  // Le premier identifiant est une méthode appelée directement sur collection
  // (l'ancien eval préfixait 'collection.'). Les étapes suivantes sont
  // séparées par un point (ex. find({}).sort(...).limit(5)).
  let first = true;
  while (true) {
    skipWhitespace();
    if (pos >= source.length) break;
    if (!first) {
      if (source[pos] !== '.') {
        throw new MongoQueryValidationError(`Expected '.' at position ${pos}, got '${source[pos] || 'end of string'}'`);
      }
      pos++;
      skipWhitespace();
    }
    const method = parseIdentifier();
    if (!ALLOWED_METHODS.has(method)) {
      throw new MongoQueryValidationError(`Method not allowed: ${method}`);
    }
    // Interdit d'appeler une méthode non-cursor après une méthode cursor si
    // elle renverrait un document — géré à l'exécution.
    expectChar('(');
    const args = [];
    skipWhitespace();
    if (source[pos] === ')') {
      pos++;
    } else {
      while (pos < source.length) {
        args.push(parseLiteral(0));
        skipWhitespace();
        if (source[pos] === ',') { pos++; continue; }
        if (source[pos] === ')') { pos++; break; }
        throw new MongoQueryValidationError(`Expected ',' or ')' at position ${pos}`);
      }
    }
    steps.push({ method, args });
    first = false;
  }

  return steps;
}

/**
 * Exécute une requête Mongo sécurisée sur une collection du driver natif.
 *
 * @param {object} collection collection du driver mongodb
 * @param {string} queryString chaîne de requête (déjà interpolée)
 * @returns {Promise<any>} résultat (sérialisable)
 */
async function executeQuery(collection, queryString) {
  const steps = parseQuery(queryString);
  if (steps.length === 0) {
    throw new MongoQueryValidationError('Empty query');
  }

  // `collection` est un objet du driver natif : on doit vérifier que chaque
  // méthode existe et est bien une fonction, avant de l'appeler.
  let current = collection;
  const cursorMethods = new Set(CURSOR_METHODS);

  // Matérialise un cursor en array si l'objet ressemble à un cursor Mongo
  // (toArray + itérable) — indépendamment du nom de la classe (les mocks et
  // les versions du driver diffèrent). Les cursors du driver sont
  // async-itérables (`Symbol.asyncIterator`), pas sync (`Symbol.iterator`).
  function isCursorLike(obj) {
    return obj != null && typeof obj.toArray === 'function' &&
      (typeof obj[Symbol.iterator] === 'function' || typeof obj[Symbol.asyncIterator] === 'function');
  }

  for (let i = 0; i < steps.length; i++) {
    const { method, args } = steps[i];
    const fn = current && typeof current[method] === 'function' ? current[method] : null;
    if (!fn) {
      throw new MongoQueryValidationError(`Method ${method} is not available on this object`);
    }
    // Les arguments ont déjà été validés comme littéraux JSON à la compilation.
    current = await fn.apply(current, args);

    // Si on a un cursor (find/aggregate) et que c'est la dernière étape,
    // on matérialise en array.
    if (isCursorLike(current) && i === steps.length - 1) {
      current = await current.toArray();
    }
  }

  // Si la valeur finale est un cursor non matérialisé (cas limite), on
  // matérialise par sécurité.
  if (isCursorLike(current)) {
    current = await current.toArray();
  }

  return current;
}

module.exports = {
  parseQuery,
  executeQuery,
  MongoQueryValidationError,
  ALLOWED_METHODS
};
