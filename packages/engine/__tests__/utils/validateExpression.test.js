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
      'let x = 1'
    ];
    for (const attack of attacks) {
      test(`bloque: ${attack.slice(0, 40)}`, () => {
        expect(() => validateExpression(attack)).toThrow();
      });
    }
  });

  describe('compatibilité production (eval et Buffer autorisés)', () => {
    test('eval("1+1") autorisé (compat, worker isolé)', () => {
      expect(() => validateExpression('eval("1+1")')).not.toThrow();
    });
    test('Buffer.from(...) autorisé (compat)', () => {
      expect(() => validateExpression('Buffer.from(x).toString("base64")')).not.toThrow();
    });
    test('eval de construction de Date autorisé (pattern prod)', () => {
      // NB : dans une vraie config, `{$.date}` est remplacé par
      // `this.resolveString('...')` AVANT la validation. Ici on teste la syntaxe
      // du pattern `eval("new " + valeur)`.
      expect(() => validateExpression('(eval("new " + dateVal)).getDate()')).not.toThrow();
    });
    test('require/process restent bloqués comme identifiants racines', () => {
      expect(() => validateExpression('require("fs")')).toThrow();
      expect(() => validateExpression('process.env')).toThrow();
      expect(() => validateExpression('fs.readFileSync("/etc/passwd")')).toThrow();
    });
  });
});
