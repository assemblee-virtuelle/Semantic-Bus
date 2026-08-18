const { parseQuery, executeQuery, MongoQueryValidationError } = require('../../utils/mongoQueryExecutor');

describe('mongoQueryExecutor - requêtes Mongo sécurisées (sans eval)', () => {
  describe('parseQuery - requêtes légitimes', () => {
    test('findOne avec objet littéral', () => {
      const steps = parseQuery('findOne({ email: "a@b.fr" })');
      expect(steps).toEqual([{ method: 'findOne', args: [{ email: 'a@b.fr' }] }]);
    });

    test('chaîne de méthodes find().sort().limit()', () => {
      const steps = parseQuery('find({}).sort({ age: -1 }).limit(5)');
      expect(steps.map(s => s.method)).toEqual(['find', 'sort', 'limit']);
      expect(steps[1].args).toEqual([{ age: -1 }]);
    });

    test('aggregate avec pipeline (opérateurs $)', () => {
      const steps = parseQuery('aggregate([{ $match: { age: { $gte: 21 } } }])');
      expect(steps[0].method).toBe('aggregate');
      expect(steps[0].args[0][0].$match.age.$gte).toBe(21);
    });

    test('distinct et countDocuments', () => {
      expect(parseQuery('distinct("ville")')[0].args).toEqual(['ville']);
      expect(parseQuery('countDocuments({})')[0].method).toBe('countDocuments');
    });
  });

  describe('parseQuery - injections bloquées', () => {
    const attacks = [
      'findOne({email:"a@b.fr"}); process.exit(0)',
      'findOne({}); require("fs")',
      'constructor.constructor("return process")()',
      'find({}); (()=>{})()',
      'x = 1; find({})',
      'find({}).sort(process)',
      'find({}).limit(process.exit())',
      'find({}); globalThis',
      'find(require("fs"))',
      'find({}); getOwnPropertyNames',
      ''
    ];
    for (const attack of attacks) {
      test(`bloque: ${attack || '<vide>'}`.slice(0, 60), () => {
        expect(() => parseQuery(attack)).toThrow(MongoQueryValidationError);
      });
    }

    test('méthode non-whitelistée bloquée', () => {
      // `deleteOne` est whitelisté mais `sort` sur un `;` échoue à la grammaire ;
      // on teste ici une méthode réellement hors whitelist sur une chaîne valide
      // serait `explain(...)` — mais elle échoue au parse comme non autorisée.
      expect(() => parseQuery('explain()')).toThrow(/Method not allowed/);
    });
  });

  describe('executeQuery', () => {
    function makeCollection() {
      const data = [
        { email: 'a@b.fr', age: 25, ville: 'Lyon' },
        { email: 'c@d.fr', age: 30, ville: 'Paris' }
      ];
      const makeCursor = () => {
        const cursor = {
          data,
          toArray: async function () { return this.data; },
          sort: function () { return this; },
          limit: function () { return this; },
          skip: function () { return this; }
        };
        cursor[Symbol.iterator] = function () { return this.data[Symbol.iterator](); };
        return cursor;
      };
      return {
        find: async () => makeCursor(),
        findOne: async (filter) => data.find(d => d.email === filter.email),
        countDocuments: async () => data.length,
        distinct: async (field) => [...new Set(data.map(d => d[field]))],
        aggregate: async () => makeCursor()
      };
    }

    test('findOne retourne le document', async () => {
      const r = await executeQuery(makeCollection(), 'findOne({ email: "a@b.fr" })');
      expect(r.email).toBe('a@b.fr');
    });

    test('find().sort().limit() retourne un array', async () => {
      const r = await executeQuery(makeCollection(), 'find({}).sort({age:-1}).limit(5)');
      expect(Array.isArray(r)).toBe(true);
      expect(r).toHaveLength(2);
    });

    test('distinct retourne les valeurs distinctes', async () => {
      const r = await executeQuery(makeCollection(), 'distinct("ville")');
      expect(r).toEqual(['Lyon', 'Paris']);
    });

    test('aggregate retourne un array', async () => {
      const r = await executeQuery(makeCollection(), 'aggregate([{ $match: { age: { $gte: 21 } } }])');
      expect(Array.isArray(r)).toBe(true);
    });

    test('requête vide rejetée', async () => {
      await expect(executeQuery(makeCollection(), '')).rejects.toThrow();
    });
  });
});