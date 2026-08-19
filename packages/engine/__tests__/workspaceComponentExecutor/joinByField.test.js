jest.mock('@semantic-bus/core/lib/fragment_lib_scylla.js', () => ({}));
jest.mock('@semantic-bus/core/helpers/promiseOrchestrator.js', () => class {
  async execute(ctx, fn, paramArray) {
    const results = [];
    for (const args of paramArray) {
      results.push(await fn.apply(ctx, args));
    }
    return results;
  }
});
jest.mock('@semantic-bus/core/helpers/dfobProcessor.js', () => ({}));
jest.mock('@semantic-bus/core/helpers/literalHelpers', () => ({
  isLiteral: () => false,
  processLiteral: (v) => v,
  testAllLiteralArray: () => false
}));

const JoinByField = require('../../workspaceComponentExecutor/joinByField');

describe('joinByField - native filter translation', () => {
  test('createFilterAndGetResult matches records on the configured field (was sift)', () => {
    const secondary = [
      { id: 1, label: 'one' },
      { id: 2, label: 'two' },
      { id: 3, label: 'three' }
    ];
    const result = JoinByField.createFilterAndGetResult(secondary, {}, 2, {
      specificData: {
        secondaryFlowId: 'id',
        multipleJoin: true
      }
    });
    expect(result).toEqual([{ id: 2, label: 'two' }]);
  });

  test('createFilterAndGetResult with multipleJoin off returns single object', () => {
    const secondary = [
      { id: 1, label: 'one' },
      { id: 2, label: 'two' }
    ];
    const result = JoinByField.createFilterAndGetResult(secondary, {}, 1, {
      specificData: {
        secondaryFlowId: 'id'
      }
    });
    expect(result).toEqual({ id: 1, label: 'one' });
  });

  test('createFilterAndGetResult with no match returns empty result', () => {
    const secondary = [
      { id: 1, label: 'one' },
      { id: 2, label: 'two' }
    ];
    const resultMultiple = JoinByField.createFilterAndGetResult(secondary, {}, 99, {
      specificData: {
        secondaryFlowId: 'id',
        multipleJoin: true
      }
    });
    expect(resultMultiple).toEqual([]);

    const resultSingle = JoinByField.createFilterAndGetResult(secondary, {}, 99, {
      specificData: {
        secondaryFlowId: 'id'
      }
    });
    expect(resultSingle).toBeUndefined();
  });
});