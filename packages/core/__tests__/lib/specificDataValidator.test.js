const { validateSpecificData } = require('../../lib/specificDataValidator.js');

describe('specificDataValidator - sanitisation à l\'écriture', () => {
  test('préserve les données normales (noms, expressions, objets)', () => {
    const input = {
      jsString: '= {$.a} + 1',
      filterString: '{"$where":"this.age >= 18"}',
      nested: { a: [1, 2, 3], b: 'x' }
    };
    expect(validateSpecificData(input)).toEqual(input);
  });

  test('supprime la clé __proto__ (prototype pollution)', () => {
    const out = validateSpecificData({ a: 1, __proto__: { polluted: true } });
    expect(out.a).toBe(1);
    expect({}.polluted).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(out, '__proto__')).toBe(false);
  });

  test('supprime les clés constructor et prototype', () => {
    const out = validateSpecificData({ constructor: { x: 1 }, prototype: { y: 2 }, ok: 1 });
    expect(Object.prototype.hasOwnProperty.call(out, 'constructor')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(out, 'prototype')).toBe(false);
    expect(out.ok).toBe(1);
  });

  test('retire les getters (pas de code déclenché à la lecture)', () => {
    let triggered = false;
    const input = {};
    Object.defineProperty(input, 'evil', {
      enumerable: true,
      get() { triggered = true; return 'boom'; }
    });
    const out = validateSpecificData(input);
    expect(triggered).toBe(false);
    expect(out).toEqual({});
  });

  test('retourne {} pour une entrée non-objet', () => {
    expect(validateSpecificData('string')).toEqual({});
    expect(validateSpecificData([1, 2])).toEqual({});
    expect(validateSpecificData(null)).toEqual({});
    expect(validateSpecificData(undefined)).toEqual({});
  });

  test('borne la profondeur (anti-bombement)', () => {
    let deep = {};
    let ref = deep;
    for (let i = 0; i < 200; i++) {
      ref.child = {};
      ref = ref.child;
    }
    const out = validateSpecificData({ top: deep });
    expect(out).toBeDefined();
    // La profondeur max (100) est atteinte sans crash
    let node = out.top;
    let depth = 0;
    while (node && node.child) { node = node.child; depth++; }
    expect(depth).toBeLessThanOrEqual(100);
  });
});
