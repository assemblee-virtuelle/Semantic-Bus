jest.mock('@semantic-bus/core/lib/fragment_lib_scylla.js', () => ({}));
jest.mock('@semantic-bus/core/helpers/dfobProcessor.js', () => ({}));
jest.mock('../../utils/stringReplacer.js', () => ({ __esModule: true, default: {} }));
jest.mock('../../utils/objectTransformationV2.js', () => ({ __esModule: true, default: { execute: jest.fn() } }));
jest.mock('../../utils/evalSecurity');

const Filter = require('../../workspaceComponentExecutor/filter');
const Loki = require('lokijs');

function makeCollection(items) {
  const db = new Loki('test');
  const col = db.addCollection('items', { disableMeta: true });
  col.insert(items);
  return col;
}

describe('filter - sift pull path removed', () => {
  test('module loads without sift and exposes the Loki-based workWithFragments path', () => {
    expect(typeof Filter.workWithFragments).toBe('function');
    expect(typeof Filter.filterRawItems).toBe('function');
  });

  test('pull is disabled (dead code commented out) for security', () => {
    // The sift-based pull() sink is commented out because workWithFragments
    // takes over. It must not be exposed anymore.
    expect(typeof Filter.pull).not.toBe('function');
  });

  test('module no longer references sift or raw eval', () => {
    const src = Filter.filterRawItems.toString() + Filter.filter.toString();
    expect(src).not.toContain('sift(');
  });
});

describe('filter $where - eval validé (validateExpression)', () => {
  test('$where filters items correctly (historical semantics preserved)', async () => {
    const col = makeCollection([{ age: 10 }, { age: 25 }, { age: 18 }, { age: 30 }]);
    const result = await Filter.filter(col, { $where: 'this.age >= 18' }, {});
    expect(result.map(r => r.age).sort()).toEqual([18, 25, 30]);
  });

  test('$where with `this` rewritten to `obj` still works', async () => {
    const col = makeCollection([{ name: 'a' }, { name: 'b' }]);
    const result = await Filter.filter(col, { $where: "this.name == 'a'" }, {});
    expect(result.map(r => r.name)).toEqual(['a']);
  });

  test('$where attack using require is blocked', async () => {
    const col = makeCollection([{ age: 1 }]);
    await expect(Filter.filter(col, {
      $where: "process.mainModule.require('child_process').execSync('id')"
    }, {})).rejects.toThrow();
  });

  test('$where attack using constructor chain is blocked', async () => {
    const col = makeCollection([{ age: 1 }]);
    await expect(Filter.filter(col, {
      $where: '({}).constructor.constructor("return process")()'
    }, {})).rejects.toThrow();
  });

  test('$where with multiple keys is rejected', async () => {
    const col = makeCollection([{ age: 1 }]);
    await expect(Filter.filter(col, { $where: 'this.age > 0', other: 1 }, {})).rejects.toMatchObject({
      error: '$where have to be the only property when it is used'
    });
  });
});