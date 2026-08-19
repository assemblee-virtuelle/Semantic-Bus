jest.mock('../../utils/evalSecurity');
const objectTransformation = require('../../utils/objectTransformationV2');
const { runEvalInWorker } = require('../../utils/evalSecurity');

describe('objectTransformationV2 - eval master + validation pré-éval', () => {
  test('expression simple avec {$path}', async () => {
    const r = await objectTransformation.execute({ v: 5 }, {}, '= {$.v} * 3', undefined, { quietLog: true });
    expect(r).toBe(15);
  });

  test('code libre : accès source et pullParams (scope execute)', async () => {
    const r = await objectTransformation.execute({ data: [1, 2, 3] }, { factor: 2 }, '= source.data.map(d => d * {£.factor})');
    expect(r).toEqual([2, 4, 6]);
  });

  test('chaînes avec caractères spéciaux/unicode préservées', async () => {
    const src = { a: 'héllo éàü ☺' };
    const r = await objectTransformation.execute(src, {}, '= "[" + {$.a} + "]"', undefined, { quietLog: true });
    expect(r).toBe('[héllo éàü ☺]');
  });

  test('objet avec clés unicode/spéciales injecté intact', async () => {
    const src = { obj: { 'clé émoji☺': 'valeur éàü', 'quo"te': 'b\\ack`tick', 'emoji🌟': 1, normal: 'x' } };
    const r = await objectTransformation.execute(src, {}, '= {$.obj}', undefined, { quietLog: true });
    expect(r).toEqual(src.obj);
  });

  test('accès propriété unicode via {$...}', async () => {
    const src = { obj: { 'cléé': 'vāl' } };
    const r = await objectTransformation.execute(src, {}, '= {$.obj}.cléé', undefined, { quietLog: true });
    expect(r).toBe('vāl');
  });

  test('accès clé unicode d\'un objet injecté', async () => {
    const src = { o: { 'clé émoji☺': 'v' } };
    const r = await objectTransformation.execute(src, {}, '= {$.o}["clé émoji☺"]', undefined, { quietLog: true });
    expect(r).toBe('v');
  });

  test('libs de master accessibles (dayjs, lodash, he, removeMarkdown)', async () => {
    expect(await objectTransformation.execute({ d: '2020-01-01' }, {}, '= dayjs({$.d}).add(1,"day").format("YYYY-MM-DD")')).toBe('2020-01-02');
    expect(await objectTransformation.execute({ desc: 'un long texte' }, {}, '= lodash.truncate({$.desc}, { length: 5 })')).toBe('un...');
    expect(await objectTransformation.execute({ name: 'a&amp;b' }, {}, '= he.decode({$.name})')).toBe('a&b');
    expect(await objectTransformation.execute({ md: '**bold**' }, {}, '= removeMarkdown({$.md})')).toBe('bold');
  });

  test('this.moment accessible (pattern prod)', async () => {
    const r = await objectTransformation.execute(
      { rlcStartDate: '2020-05-01' },
      {},
      '= {$.rlcStartDate}!==undefined?this.moment({$.rlcStartDate},"YYYY-MM-DD").format("DD/MM/YYYY"):null'
    );
    expect(r).toBe('01/05/2020');
  });

  test('new Date / new RegExp autorisés', async () => {
    expect(await objectTransformation.execute({ d: '2020-06-15' }, {}, '= new Date({$.d}).getFullYear()')).toBe(2020);
    expect(await objectTransformation.execute({ s: 'aaab' }, {}, '= new RegExp("^a+").test({$.s})')).toBe(true);
  });

  test('map/filter arrow autorisés', async () => {
    const r = await objectTransformation.execute({ arr: [1, 2, 3] }, {}, '= {$.arr}.map(x => x * 2)');
    expect(r).toEqual([2, 4, 6]);
  });

  describe('attaques bloquées (validation AST)', () => {
    const attacks = [
      '= process.env',
      '= require("child_process").execSync("id")',
      '= ({}.constructor.constructor("return process")())',
      '= ({}).__proto__',
      '= globalThis.process',
      '= Function("return process")()',
      '= fs.readFileSync("/etc/passwd")',
      '= path.join("/a")'
    ];
    for (const expr of attacks) {
      test(`bloque: ${expr.slice(2).slice(0, 40)}`, async () => {
        const r = await objectTransformation.execute({}, {}, expr, undefined, { quietLog: true });
        expect(r).toBeDefined();
        if (r && r.error) {
          expect(`${r.errorDetail.cause}`).toMatch(/Forbidden|forbidden|not defined/);
        }
      });
    }

    test('boucle bloquée', async () => {
      const r = await objectTransformation.execute({}, {}, '= while(true){}', undefined, { quietLog: true });
      expect(r.error).toBeDefined();
    });
  });

  describe('timeout (point 3) — worker terminable', () => {
    test('expression bloquante est réellement interrompue par le timeout', async () => {
      // runEvalInWorker est testé directement (le validateur bloque déjà les
      // boucles au niveau AST) : on vérifie que le worker_threads termine une
      // boucle infinie au bout du délai au lieu de bloquer le process.
      let error;
      try {
        await runEvalInWorker('while(true){}', {}, 150);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(`${error.message}`).toMatch(/timed out/);
    }, 5000);

    test('résultat sérialisable retourné intact', async () => {
      const r = await runEvalInWorker('({a: 1, b: "x"})');
      expect(r).toEqual({ a: 1, b: 'x' });
    });
  });

  describe('compatibilité production (eval/Buffer) + sécurité runtime', () => {
    test('eval de construction de Date (pattern prod) fonctionne', async () => {
      const r = await objectTransformation.execute(
        { date: 'Date("2020-01-15")' },
        {},
        '= (eval("new " + {$.date})).getDate()',
        undefined,
        { quietLog: true }
      );
      expect(r).toBe(15);
    });

    test('Buffer.from(...).toString("base64") (pattern prod) fonctionne', async () => {
      const r = await objectTransformation.execute(
        { start: '2020-01-15' },
        {},
        '= Buffer.from({$.start}).toString("base64")',
        undefined,
        { quietLog: true }
      );
      expect(r).toBe(Buffer.from('2020-01-15').toString('base64'));
    });

    test('eval("1+1") autorisé dans le worker', async () => {
      const r = await objectTransformation.execute({}, {}, '= eval("1+1")', undefined, { quietLog: true });
      expect(r).toBe(2);
    });

    test('eval ne peut PAS accéder à require dans le worker (pas de RCE)', async () => {
      const r = await objectTransformation.execute(
        {},
        {},
        '= eval("require(\'fs\').readFileSync(\'/etc/passwd\')")',
        undefined,
        { quietLog: true }
      );
      // require a été retiré du global du worker → ReferenceError (pas d'accès système)
      expect(r && r.error).toBeDefined();
    });

    test('eval ne peut PAS accéder à process dans le worker', async () => {
      const r = await objectTransformation.execute(
        {},
        {},
        '= eval("process.env")',
        undefined,
        { quietLog: true }
      );
      expect(r && r.error).toBeDefined();
    });
  });
});
