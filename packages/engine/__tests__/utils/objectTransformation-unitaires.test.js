const transformationObjectV1 = require('../../utils/objectTransformation.js');
const transformationObjectV2 = require('../../utils/objectTransformationV2.js');

describe('Object Transformation Tests (from test_unitaires)', () => {
  describe('Simple Mapping', () => {
    test('simple mapping V1', () => {
      const source1 = { attr1: 'value1' };
      const pattern1 = { attr2: '$.attr1' };
      const result = transformationObjectV1.executeWithParams(source1, undefined, pattern1);
      expect(result.attr2).toBe('value1');
    });

    test('simple mapping V2', () => {
      const source1 = { attr1: 'value1' };
      const pattern1 = { attr2: '$.attr1' };
      const result = transformationObjectV2.executeWithParams(source1, undefined, pattern1);
      expect(result.attr2).toBe('value1');
    });
  });

  describe('Dot Property Access', () => {
    test('dot prop simple V1', () => {
      const source2 = { attr1: { attr2: "value1" } };
      const pattern2 = { attr3: '$.attr1.attr2' };
      const result = transformationObjectV1.executeWithParams(source2, undefined, pattern2);
      expect(result.attr3).toBe('value1');
    });

    test('dot prop simple V2', () => {
      const source2 = { attr1: { attr2: "value1" } };
      const pattern2 = { attr3: '$.attr1.attr2' };
      const result = transformationObjectV2.executeWithParams(source2, undefined, pattern2);
      expect(result.attr3).toBe('value1');
    });
  });

  describe('Embedded Patterns', () => {
    test('embended pattern simple V1', () => {
      const source3 = { attr1: "value1" };
      const pattern3 = { attr2: { attr3: "$.attr1" } };
      const result = transformationObjectV1.executeWithParams(source3, undefined, pattern3);
      expect(result.attr2.attr3).toBe('value1');
    });

    test('embended pattern simple V2', () => {
      const source3 = { attr1: "value1" };
      const pattern3 = { attr2: { attr3: "$.attr1" } };
      const result = transformationObjectV2.executeWithParams(source3, undefined, pattern3);
      expect(result.attr2.attr3).toBe('value1');
    });
  });

  describe('Numeric Values', () => {
    test('numeric V1', () => {
      const source4 = { attr1: 999 };
      const pattern4 = { attr2: "$.attr1" };
      const result = transformationObjectV1.executeWithParams(source4, undefined, pattern4);
      expect(result.attr2).toBe(999);
    });

    test('numeric V2', () => {
      const source4 = { attr1: 999 };
      const pattern4 = { attr2: "$.attr1" };
      const result = transformationObjectV2.executeWithParams(source4, undefined, pattern4);
      expect(result.attr2).toBe(999);
    });
  });

  describe('Root Access', () => {
    test('root V1', () => {
      const source5 = [{ attr1: 'value1' }, { attr1: 'value2' }];
      const pattern5 = { attr2: '$..' };
      const result = transformationObjectV1.executeWithParams(source5, undefined, pattern5);
      expect(result.attr2).toStrictEqual(source5);
    });

    test('root V2', () => {
      const source5 = [{ attr1: 'value1' }, { attr1: 'value2' }];
      const pattern5 = { attr2: '$..' };
      const result = transformationObjectV2.executeWithParams(source5, undefined, pattern5);
      expect(result.attr2).toStrictEqual(source5);
    });
  });

  describe('Fixed Values', () => {
    test('fix V1', () => {
      const source7 = { attr1: 'value1' };
      const pattern7 = { attr2: 'value2' };
      const result = transformationObjectV1.executeWithParams(source7, undefined, pattern7);
      expect(result.attr2).toStrictEqual('value2');
    });

    test('fix V2', () => {
      const source7 = { attr1: 'value1' };
      const pattern7 = { attr2: 'value2' };
      const result = transformationObjectV2.executeWithParams(source7, undefined, pattern7);
      expect(result.attr2).toStrictEqual('value2');
    });
  });

  describe('Evaluation Expressions', () => {
    test('simple eval V1', () => {
      const source8 = { attr1: 'value1' };
      const pattern8 = { attr2: '={$.attr1}' };
      const result = transformationObjectV1.executeWithParams(source8, undefined, pattern8);
      expect(result.attr2).toBe('value1');
    });

    test('simple eval V2', () => {
      const source8 = { attr1: 'value1' };
      const pattern8 = { attr2: '={$.attr1}' };
      const result = transformationObjectV2.executeWithParams(source8, undefined, pattern8);
      expect(result.attr2).toBe('value1');
    });

    test('eval concat string V1', () => {
      const source9 = { attr1: 'value1', attr2: 'value2' };
      const pattern9 = { attr2: "={$.attr1}+' '+{$.attr2}" };
      const result = transformationObjectV1.executeWithParams(source9, undefined, pattern9);
      expect(result.attr2).toBe('value1 value2');
    });

    test('eval concat string V2', () => {
      const source9 = { attr1: 'value1', attr2: 'value2' };
      const pattern9 = { attr2: "={$.attr1}+' '+{$.attr2}" };
      const result = transformationObjectV2.executeWithParams(source9, undefined, pattern9);
      expect(result.attr2).toBe('value1 value2');
    });
  });

  describe('Pull Parameters', () => {
    test('pullParams V1', () => {
      const source10 = { attr1: 'value1' };
      const pullParams10 = { attr1: 'value2' };
      const pattern10 = { attr1: '$.attr1', attr2: '£.attr1' };
      const result = transformationObjectV1.executeWithParams(source10, pullParams10, pattern10);
      expect(result.attr1).toBe('value1');
      expect(result.attr2).toBe('value2');
    });

    test('pullParams V2', () => {
      const source10 = { attr1: 'value1' };
      const pullParams10 = { attr1: 'value2' };
      const pattern10 = { attr1: '$.attr1', attr2: '£.attr1' };
      const result = transformationObjectV2.executeWithParams(source10, pullParams10, pattern10);
      expect(result.attr1).toBe('value1');
      expect(result.attr2).toBe('value2');
    });

    test('pullParams & eval V1', () => {
      const source10 = { attr1: 'value1' };
      const pullParams10 = { attr1: 'value2' };
      const pattern11 = { attr1: "={$.attr1}+' '+{£.attr1}" };
      const result = transformationObjectV1.executeWithParams(source10, pullParams10, pattern11);
      expect(result.attr1).toBe('value1 value2');
    });

    test('pullParams & eval V2', () => {
      const source10 = { attr1: 'value1' };
      const pullParams10 = { attr1: 'value2' };
      const pattern11 = { attr1: "={$.attr1}+' '+{£.attr1}" };
      const result = transformationObjectV2.executeWithParams(source10, pullParams10, pattern11);
      expect(result.attr1).toBe('value1 value2');
    });

    test('pullParams & eval 2 V1', () => {
      const source12 = { attr1: { attr2: 'value1' } };
      const pullParams12 = { attr1: 'attr2' };
      const pattern12 = { attr1: '={$.attr1}[{£.attr1}]' };
      const result = transformationObjectV1.executeWithParams(source12, pullParams12, pattern12);
      expect(result.attr1).toBe('value1');
    });

    test('pullParams & eval 2 V2', () => {
      const source12 = { attr1: { attr2: 'value1' } };
      const pullParams12 = { attr1: 'attr2' };
      const pattern12 = { attr1: '={$.attr1}[{£.attr1}]' };
      const result = transformationObjectV2.executeWithParams(source12, pullParams12, pattern12);
      expect(result.attr1).toBe('value1');
    });
  });

  describe('Array Operations', () => {
    test('eval array V1', () => {
      const source13 = [1, 2, 3, 4, 5];
      const pattern13 = { attr1: '={$..}.map(r=>r*2)' };
      const result = transformationObjectV1.executeWithParams(source13, undefined, pattern13);
      expect(result.attr1).toStrictEqual([2, 4, 6, 8, 10]);
    });

    test('eval array 2 V2', () => {
      const source13 = [1, 2, 3, 4, 5];
      const pattern13 = { attr1: '={$..}.map(r=>r*2)' };
      const result = transformationObjectV2.executeWithParams(source13, undefined, pattern13);
      expect(result.attr1).toStrictEqual([2, 4, 6, 8, 10]);
    });
  });
}); 