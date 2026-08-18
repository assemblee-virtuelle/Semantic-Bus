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
    });

    test('find() sur un cursor async-itérable (driver mongo) est matérialisé en array', async () => {
      // Le driver mongodb expose Symbol.asyncIterator (pas Symbol.iterator).
      // Le cursor ne doit PAS être renvoyé tel quel (sinon EJSON.stringify
      // crashe sur la structure circulaire interne du cursor).
      const data = [{ a: 1 }, { a: 2 }];
      const cursor = {
        data,
        toArray: async function () { return this.data; },
        [Symbol.asyncIterator]: async function* () {
          for (const d of this.data) yield d;
        }
      };
      const collection = { find: async () => cursor };
      const r = await executeQuery(collection, 'find({})');
      expect(Array.isArray(r)).toBe(true);
      expect(r).toEqual([{ a: 1 }, { a: 2 }]);
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

  describe('constructeurs whitelistés (ObjectId, ISODate, NumberLong, ...)', () => {
    test('parse `new ObjectId("...")` en marqueur résolu à l\'exécution', async () => {
      const steps = parseQuery('find({ project: new ObjectId("67f3b279bb24fd7b3a5ff36b") })');
      expect(steps[0].args[0].project).toEqual({
        __mongoCtor: 'ObjectId',
        args: ['67f3b279bb24fd7b3a5ff36b']
      });
      const { ObjectId } = require('mongodb');
      const collection = {
        find: async (filter) => {
          expect(filter.project).toBeInstanceOf(ObjectId);
          expect(filter.project.toHexString()).toBe('67f3b279bb24fd7b3a5ff36b');
          return [filter];
        }
      };
      const r = await executeQuery(collection, 'find({ project: new ObjectId("67f3b279bb24fd7b3a5ff36b") })');
      expect(r[0].project.toHexString()).toBe('67f3b279bb24fd7b3a5ff36b');
    });

    test('ObjectId sans `new` et ISODate dans un aggregate', async () => {
      const steps = parseQuery('aggregate([{ $match: { _id: ObjectId("abc"), createdAt: { $gte: ISODate("2024-01-01T00:00:00Z") } } }])');
      const match = steps[0].args[0][0].$match;
      expect(match._id.__mongoCtor).toBe('ObjectId');
      expect(match.createdAt.$gte).toEqual({ __mongoCtor: 'ISODate', args: ['2024-01-01T00:00:00Z'] });
    });

    test('NumberLong et NumberDecimal résolus', async () => {
      const collection = {
        find: async (filter) => {
          expect(filter.n).toBeInstanceOf(require('mongodb').Long);
          expect(filter.d).toBeInstanceOf(require('mongodb').Decimal128);
          return [filter];
        }
      };
      const r = await executeQuery(collection, 'find({ n: NumberLong(42), d: NumberDecimal("1.5") })');
      expect(r[0].n.toNumber()).toBe(42);
      expect(r[0].d.toString()).toBe('1.5');
    });

    test('constructeur non whitelisté rejeté', () => {
      expect(() => parseQuery('find({ a: eval("1+1") })')).toThrow(/Unexpected token/);
      expect(() => parseQuery('find({ a: ObjectIdMath(1) })')).toThrow(/Unexpected token/);
    });
  });
});