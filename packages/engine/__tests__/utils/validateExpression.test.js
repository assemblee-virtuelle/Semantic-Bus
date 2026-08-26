const { validateExpression, ExpressionValidationError } = require('../../utils/validateExpression');

describe('validateExpression - contrôle du contenu avant éval', () => {
  describe('expressions légitimes (compatibilité prod)', () => {
    test('appels de libs de master', () => {
      expect(() => validateExpression('dayjs("2020-01-01").format("YYYY")')).not.toThrow();
      expect(() => validateExpression('moment("2020-01-02").format("DD/MM/YYYY")')).not.toThrow();
      expect(() => validateExpression('lodash.truncate(x, {length: 5})')).not.toThrow();
      expect(() => validateExpression('he.decode(x)')).not.toThrow();
      expect(() => validateExpression('removeMarkdown(x)')).not.toThrow();
      expect(() => validateExpression('this.moment(x, "YYYY-MM-DD")')).not.toThrow();
      expect(() => validateExpression('decodeUnicode(x)')).not.toThrow();
    });

    test('constructeurs autorisés', () => {
      expect(() => validateExpression('new Date(2020,0,1)')).not.toThrow();
      expect(() => validateExpression('new RegExp("^a+")')).not.toThrow();
      expect(() => validateExpression('new Map()')).not.toThrow();
    });

    test('méthodes et arrow functions', () => {
      expect(() => validateExpression('s.toUpperCase()')).not.toThrow();
      expect(() => validateExpression('items.map(x => x * 2).reduce((a,b) => a+b, 0)')).not.toThrow();
      expect(() => validateExpression('a ? b : c')).not.toThrow();
      expect(() => validateExpression('Math.round(x/y*100)/100')).not.toThrow();
    });

    test('crypto utilisable (lib de prod)', () => {
      expect(() => validateExpression('crypto.createHash("sha256").update(x).digest("hex")')).not.toThrow();
      expect(() => validateExpression('crypto.randomUUID()')).not.toThrow();
      expect(() => validateExpression('crypto.randomBytes(16).toString("hex")')).not.toThrow();
    });

    test('update/set sur récepteur NON lodash autorisé', () => {
      expect(() => validateExpression('crypto.createHash("sha256").update(x)')).not.toThrow();
      expect(() => validateExpression('obj.set("a")')).not.toThrow();
    });

    test('proto-pollution lodash bloquée', () => {
      expect(() => validateExpression('lodash.merge(a, b)')).toThrow();
      expect(() => validateExpression('_.set(a, "x", b)')).toThrow();
      expect(() => validateExpression('_.defaultsDeep(a, b)')).toThrow();
      expect(() => validateExpression('lodash.update(a, "x", f)')).toThrow();
    });

    test('lodash.template bloqué (RCE host realm via Function)', () => {
      // PoC du chercheur (Maxim Yakovlev) : lodash.template compile son corps
      // avec un Function du host realm, échappant au contexte vm.
      expect(() => validateExpression("lodash.template('<% import(\"fs\") %>')()")).toThrow(/Forbidden method call on lodash: template/);
      expect(() => validateExpression('_.template("x")')).toThrow(/Forbidden method call on lodash: template/);
      expect(() => validateExpression('lodash.templateSettings')).toThrow(/Forbidden method on lodash: templateSettings/);
      // lodash.truncate (légitime) reste autorisé
      expect(() => validateExpression('lodash.truncate(a, { length: 5 })')).not.toThrow();
    });
  });

  describe('attaques bloquées', () => {
    const attacks = [
      'process.env',
      'require("fs")',
      '({}).constructor.constructor("return process")()',
      '({}).__proto__',
      'globalThis.process',
      'Function("return process")()',
      'module.exports',
      'exports',
      'fs.readFileSync("/etc/passwd")',
      'path.join("/a")',
      'child_process.execSync("id")',
      'console.log("x")',
      'new Buffer(1)',
      'new Foo()',
      'while(true){}',
      'for(;;){}',
      'let x = 1',
      // Vecteurs natifs Node (objets natifs) — bloqués par le validateur
      'Array.constructor("return process")()',
      '({}).constructor("return process")()',
      'String.prototype.toLowerCase()',
      'Array.prototype.map',
      'Object.constructor("return process")()',
      'obj.constructor.constructor("return process")()',
      'Function.constructor("return process")()',
      'Symbol.constructor("return process")()',
      'Date.constructor("return process")()'
    ];
    for (const attack of attacks) {
      test(`bloque: ${attack.slice(0, 40)}`, () => {
        expect(() => validateExpression(attack)).toThrow();
      });
    }
  });

  describe('clés computed — constant-folding (SB-RCE-2026-01, review chercheur 2026-08-24)', () => {
    describe('clés statiquement résolubles bloquées', () => {
      const foldedAttacks = [
        // PoC chercheur : computed non-littéral qui contournait FORBIDDEN_PROPERTIES
        "he.decode['con'+'structor']",
        "he.decode['con'+'structor']('return 6*7')",
        // concaténations imbriquées / templates sans interpolation
        "he.decode['con' + ('struc' + 'tor')]",
        'he.decode[`con${""}structor`]',
        // whitelist par lib appliquée aux valeurs repliées
        "he.decode['tem'+'plate']",
        "lodash['map'+'x']",
        // autres helpers host-realm exposés
        "sanitizeHtml['con'+'structor']",
        "removeMarkdown['con'+'structor']",
        "dotProp['con'+'structor']"
      ];
      for (const src of foldedAttacks) {
        test(`bloque (folding): ${src.slice(0, 50)}`, () => {
          expect(() => validateExpression(src)).toThrow();
        });
      }
    });

    describe('cas légitimes préservés', () => {
      test('index numériques et clés dynamiques', () => {
        expect(() => validateExpression('arr[0]')).not.toThrow();
        expect(() => validateExpression('arr[1+1]')).not.toThrow();
        expect(() => validateExpression('obj[key]')).not.toThrow();
        expect(() => validateExpression('arr[i]')).not.toThrow();
      });
      test('clé repliée autorisée par la whitelist de la lib', () => {
        expect(() => validateExpression("he.decode['dec'+'ode']('x')")).not.toThrow();
        expect(() => validateExpression('he.decode(x)')).not.toThrow();
      });
      test('clé repliée hors whitelist sur lib exposée bloquée', () => {
        expect(() => validateExpression("he.decode['ve'+'rsion']")).toThrow();
      });
    });
  });

  describe('whitelist par lib étendue (SB-RCE-2026-01, point 2)', () => {
    test('dotProp.set bloqué (proto-pollution passant le validateur auparavant)', () => {
      expect(() => validateExpression("dotProp.set({}, ['a','b'], 1)")).toThrow();
      expect(() => validateExpression("dotProp['se'+'t']({}, ['a','b'], 1)")).toThrow();
    });
    test('dotProp.get/has autorisés', () => {
      expect(() => validateExpression("dotProp.get(obj, 'a.b')")).not.toThrow();
      expect(() => validateExpression("dotProp.has(obj, 'a.b')")).not.toThrow();
      expect(() => validateExpression("dotProp.delete(obj, 'a.b')")).not.toThrow();
    });
    test('cheerio.load autorisé (pattern prod), autres statics bloqués', () => {
      expect(() => validateExpression('cheerio.load("<li>a</li>")("li").text()')).not.toThrow();
      expect(() => validateExpression('cheerio.merge([], [])')).toThrow();
      expect(() => validateExpression('cheerio.fromURL("http://x")')).toThrow();
    });
    test('sanitizeHtml/removeMarkdown en appel nu autorisés, membres bloqués', () => {
      expect(() => validateExpression('sanitizeHtml(html, { allowedTags: ["p"] })')).not.toThrow();
      expect(() => validateExpression('sanitizeHtml.defaults')).toThrow();
      expect(() => validateExpression('removeMarkdown(md)')).not.toThrow();
      expect(() => validateExpression('removeMarkdown.someMethod(x)')).toThrow();
      expect(() => validateExpression('decodeUnicode(s)')).not.toThrow();
    });
  });

  describe('JS intrinsics en whitelist stricte (SB-RCE-2026-01)', () => {
    test('statiques whitelistés autorisés (patterns prod)', () => {
      expect(() => validateExpression('Math.round(x/y*100)/100')).not.toThrow();
      expect(() => validateExpression('Math.floor(x)')).not.toThrow();
      expect(() => validateExpression('JSON.parse(x)')).not.toThrow();
      expect(() => validateExpression('JSON.stringify(v)')).not.toThrow();
      expect(() => validateExpression('Object.keys(x)')).not.toThrow();
      expect(() => validateExpression('Object.values(x)')).not.toThrow();
      expect(() => validateExpression('Object.entries(x)')).not.toThrow();
      expect(() => validateExpression('Object.assign({}, a, b)')).not.toThrow();
      expect(() => validateExpression('String.fromCharCode(65)')).not.toThrow();
      expect(() => validateExpression('Array.isArray(x)')).not.toThrow();
      expect(() => validateExpression('Number.isInteger(x)')).not.toThrow();
      expect(() => validateExpression('Date.now()')).not.toThrow();
    });
    test('introspection / construction bloquées (vecteur argument-string)', () => {
      // Le vecteur découvert au-delà des points du chercheur : passer le nom de
      // propriété dangereux en ARGUMENT string des built-ins d'introspection.
      expect(() => validateExpression('Reflect.get(he.decode, "con"+"structor")("return 6*7")')).toThrow();
      expect(() => validateExpression('Reflect.get(he, "constructor")')).toThrow();
      expect(() => validateExpression('Reflect.construct(Function, [])')).toThrow();
      expect(() => validateExpression('Object.getPrototypeOf(he.decode)')).toThrow();
      expect(() => validateExpression('Object.getOwnPropertyDescriptor(he, "constructor")')).toThrow();
      expect(() => validateExpression('Object.getOwnPropertyNames(he)')).toThrow();
      expect(() => validateExpression('Object.defineProperty({}, "x", {value: 1})')).toThrow();
      expect(() => validateExpression('Object.setPrototypeOf({}, null)')).toThrow();
      expect(() => validateExpression('new Proxy({}, {})')).toThrow();
      expect(() => validateExpression('Proxy.x')).toThrow();
    });
  });

  describe('objets produits par les libs — whitelist (SB-RCE-2026-01)', () => {
    test('méthodes whitelistées autorisées (patterns prod)', () => {
      expect(() => validateExpression('dayjs(v).format("DD-MM-YYYY")')).not.toThrow();
      expect(() => validateExpression('dayjs(v).add(1, "day").format("YYYY")')).not.toThrow();
      expect(() => validateExpression('dayjs(v).diff(dayjs(w), "minute")')).not.toThrow();
      expect(() => validateExpression('this.moment(v,"YYYY-MM-DD").format("DD/MM/YYYY")')).not.toThrow();
      expect(() => validateExpression('crypto.createHash("sha256").update(v).digest("hex")')).not.toThrow();
      expect(() => validateExpression('cheerio.load(html)("li").map((i, el) => cheerio.load(html)(el).text()).get()')).not.toThrow();
      expect(() => validateExpression('Buffer.from(v).toString("base64")')).not.toThrow();
    });
    test('méthodes hors whitelist sur objets produits bloquées', () => {
      expect(() => validateExpression('dayjs(v).evilMethod()')).toThrow(/Forbidden method on dayjsInstance/);
      expect(() => validateExpression('moment(v).evilMethod()')).toThrow(/Forbidden method on momentInstance/);
      expect(() => validateExpression('crypto.createHash("x").evilMethod()')).toThrow(/Forbidden method on hash/);
      expect(() => validateExpression('Buffer.from(x).evilMethod()')).toThrow(/Forbidden method on bufferResult/);
      expect(() => validateExpression('cheerio.load(x)(sel).evilMethod()')).toThrow(/Forbidden method on cheerioInstance/);
      expect(() => validateExpression('cheerio.load(x).fromURL("http://x")')).toThrow(/Forbidden method on cheerioCallable/);
      expect(() => validateExpression('dayjs(v).add(1,"d").evil()')).toThrow(/Forbidden method on dayjsInstance/);
    });
  });

  describe('compatibilité production (eval et Buffer autorisés)', () => {
    test('eval("1+1") autorisé (compat, worker isolé)', () => {
      expect(() => validateExpression('eval("1+1")')).not.toThrow();
    });
    test('Buffer.from(...) autorisé (compat)', () => {
      expect(() => validateExpression('Buffer.from(x).toString("base64")')).not.toThrow();
    });
    test('eval de construction de Date autorisé (pattern prod)', () => {
      // Pattern prod : `(eval("new " + {$.date})).getDate()` — le contenu de la
      // valeur est une donnée du flux (jamais inlinée dans l'expression).
      expect(() => validateExpression('(eval("new " + dateVal)).getDate()')).not.toThrow();
    });
    test('require/process restent bloqués comme identifiants racines', () => {
      expect(() => validateExpression('require("fs")')).toThrow();
      expect(() => validateExpression('process.env')).toThrow();
      expect(() => validateExpression('fs.readFileSync("/etc/passwd")')).toThrow();
    });
  });
});
