jest.mock('../../utils/evalSecurity');
const objectTransformation = require('../../utils/objectTransformationV2');

// -----------------------------------------------------------------------------
// Jeu de tests d'acceptation (matrice de compatibilité) basé sur l'audit de
// production : libs réellement utilisées par les 2879 composants prod
// (dayjs, moment, this.moment, lodash, he, removeMarkdown, sanitizeHtml,
// cheerio, decodeUnicode, crypto). On verrouille ici la compatibilité des
// expressions de prod avec l'implémentation sécurisée (eval master + validateur
// AST + worker). Les patterns issus de la base Mongo prod
// (`semantic-bus-prod-all/config.json`, collection `workspacecomponents`,
// champ `specificData`) doivent être ajoutés ici comme jeux d'acceptation.
// -----------------------------------------------------------------------------

describe('Compatibility matrix - libs de production', () => {
  test('sanitizeHtml (assainit un HTML)', async () => {
    const r = await objectTransformation.execute(
      { html: '<p onclick="evil()">Hello</p>' },
      {},
      '= sanitizeHtml({$.html}, { allowedTags: ["p"] })'
    );
    expect(r).toBe('<p>Hello</p>');
  });

  test('cheerio (parse DOM et extrait du texte)', async () => {
    const r = await objectTransformation.execute(
      { html: '<ul><li>a</li><li>b</li></ul>' },
      {},
      '= cheerio.load({$.html})("li").map((i, el) => cheerio.load({$.html})(el).text()).get()'
    );
    expect(r).toEqual(['a', 'b']);
  });

  test('decodeUnicode (décodage \\uXXXX)', async () => {
    const r = await objectTransformation.execute(
      { s: 'caf\\u00e9' },
      {},
      '= decodeUnicode({$.s})'
    );
    expect(r).toBe('café');
  });

  test('moment natif (new Date + format)', async () => {
    const r = await objectTransformation.execute(
      { d: '2021-12-25' },
      {},
      '= new Date({$.d}).getUTCFullYear()'
    );
    expect(r).toBe(2021);
  });

  test('chaîne de prod : this.moment dans un objet', async () => {
    const r = await objectTransformation.execute(
      { start: '2020-01-15' },
      {},
      { date: '= this.moment({$.start}).format("DD/MM/YYYY")', static: 'fixe' }
    );
    expect(r).toEqual({ date: '15/01/2020', static: 'fixe' });
  });

  test('expression imbriquée (objet + tableau) compatible', async () => {
    const r = await objectTransformation.execute(
      { items: [{ v: 1 }, { v: 2 }] },
      { coef: 10 },
      { total: '= {$.items}.reduce((acc, it) => acc + it.v, 0) * {£.coef}', labels: ['= "item-" + {$.items}[0].v'] }
    );
    expect(r).toEqual({ total: 30, labels: ['item-1'] });
  });

  test('crypto utilisable (createHash) — lib de prod restaurée', async () => {
    const r = await objectTransformation.execute(
      { s: 'hello' },
      {},
      '= crypto.createHash("sha256").update({$.s}).digest("hex")'
    );
    expect(r).toMatch(/^[0-9a-f]{64}$/);
  });

  test('crypto randomUUID utilisable', async () => {
    const r = await objectTransformation.execute({}, {}, '= crypto.randomUUID()');
    expect(r).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  describe('patterns prod réels (extraits de semantic-bus-prod-all)', () => {
    test('moment conditionnel (pattern prod objectTransformer)', async () => {
      const r = await objectTransformation.execute(
        { rlcStartDate: '2020-05-01' },
        {},
        '= {$.rlcStartDate}!==undefined?this.moment({$.rlcStartDate},"YYYY-MM-DD").format("DD/MM/YYYY"):undefined'
      );
      expect(r).toBe('01/05/2020');
    });

    test('dayjs format + diff (pattern prod)', async () => {
      const r = await objectTransformation.execute(
        { start: '2020-01-01' },
        {},
        '= dayjs({$.start}).format("DD-MM-YYYY")'
      );
      expect(r).toBe('01-01-2020');
    });

    test('he.decode (pattern prod)', async () => {
      const r = await objectTransformation.execute(
        { pairs: 'a&amp;b' },
        {},
        '= he.decode({$.pairs})'
      );
      expect(r).toBe('a&b');
    });

    test('eval("new "+...) pour construire une Date (pattern prod)', async () => {
      const r = await objectTransformation.execute(
        { date: 'Date("2020-01-15")' },
        {},
        '= (eval("new " + {$.date})).getDate()',
        undefined,
        { quietLog: true }
      );
      expect(r).toBe(15);
    });

    test('Buffer.from(...).toString("base64") (pattern prod)', async () => {
      const r = await objectTransformation.execute(
        { start: '2020-01-15' },
        {},
        '= Buffer.from({$.start}).toString("base64")',
        undefined,
        { quietLog: true }
      );
      expect(r).toBe(Buffer.from('2020-01-15').toString('base64'));
    });
  });
});
