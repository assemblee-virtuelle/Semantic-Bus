jest.mock('@semantic-bus/core/lib/fragment_lib_scylla.js', () => ({}));
jest.mock('@semantic-bus/core/helpers/dfobProcessor.js', () => ({}));
jest.mock('../../utils/stringReplacer.js', () => ({ __esModule: true, default: {} }));
jest.mock('../../utils/objectTransformationV2.js', () => ({ __esModule: true, default: { execute: jest.fn() } }));
jest.mock('../../utils/evalSecurity');

const ArraySplit = require('../../workspaceComponentExecutor/arraySplitByCondition');
const Loki = require('lokijs');

function makeCollection(items) {
  const db = new Loki('test');
  const col = db.addCollection('items', { disableMeta: true });
  col.insert(items);
  return col;
}

describe('arraySplitByCondition $where - sandboxed evaluation', () => {
  test('$where filters items correctly', async () => {
    const col = makeCollection([{ v: 1 }, { v: 5 }, { v: 10 }]);
    const result = await ArraySplit.filterWithLoki(col, { $where: 'this.v > 3' }, {});
    expect(result.map(r => r.v).sort((a, b) => a - b)).toEqual([5, 10]);
  });

  test('$where attack using require is blocked', async () => {
    const col = makeCollection([{ v: 1 }]);
    await expect(ArraySplit.filterWithLoki(col, {
      $where: "process.mainModule.require('child_process').execSync('id')"
    }, {})).rejects.toThrow();
  });

  test('$where with multiple keys is rejected', async () => {
    const col = makeCollection([{ v: 1 }]);
    await expect(ArraySplit.filterWithLoki(col, { $where: 'this.v > 0', other: 1 }, {})).rejects.toMatchObject({
      error: '$where have to be the only property when it is used'
    });
  });

  test('non-$where filter uses native Loki find', async () => {
    const col = makeCollection([{ v: 1 }, { v: 5 }]);
    const result = await ArraySplit.filterWithLoki(col, { v: 5 }, {});
    expect(result.map(r => r.v)).toEqual([5]);
  });
});