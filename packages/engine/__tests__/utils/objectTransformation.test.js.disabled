const transformationObjectV1 = require('../../utils/objectTransformation.js');
const transformationObjectV2 = require('../../utils/objectTransformationV2.js');

describe('Object Transformation V1', () => {
  describe('Simple mapping', () => {
    test('should map simple property', () => {
      const source = { attr1: 'value1' };
      const pattern = { attr2: '$.attr1' };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.attr2).toBe('value1');
    });

    test('should handle numeric values', () => {
      const source = { attr1: 999 };
      const pattern = { attr2: '$.attr1' };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.attr2).toBe(999);
    });

    test('should handle fixed values', () => {
      const source = { attr1: 'value1' };
      const pattern = { attr2: 'value2' };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.attr2).toBe('value2');
    });
  });

  describe('Dot property access', () => {
    test('should access nested properties', () => {
      const source = { attr1: { attr2: 'value1' } };
      const pattern = { attr3: '$.attr1.attr2' };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.attr3).toBe('value1');
    });
  });

  describe('Embedded patterns', () => {
    test('should handle embedded object patterns', () => {
      const source = { attr1: 'value1' };
      const pattern = { attr2: { attr3: '$.attr1' } };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.attr2.attr3).toBe('value1');
    });
  });

  describe('Root access', () => {
    test('should access root array', () => {
      const source = [{ attr1: 'value1' }, { attr1: 'value2' }];
      const pattern = { attr2: '$..' };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.attr2).toStrictEqual(source);
    });
  });

  describe('Evaluation expressions', () => {
    test('should evaluate simple expressions', () => {
      const source = { attr1: 'value1' };
      const pattern = { attr2: '={$.attr1}' };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.attr2).toBe('value1');
    });

    test('should evaluate string concatenation', () => {
      const source = { attr1: 'value1', attr2: 'value2' };
      const pattern = { attr2: "={$.attr1}+' '+{$.attr2}" };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.attr2).toBe('value1 value2');
    });

    test('should evaluate array operations', () => {
      const source = [1, 2, 3, 4, 5];
      const pattern = { attr1: '={$..}.map(r=>r*2)' };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.attr1).toStrictEqual([2, 4, 6, 8, 10]);
    });
  });

  describe('Pull parameters', () => {
    test('should use pull parameters', () => {
      const source = { attr1: 'value1' };
      const pullParams = { attr1: 'value2' };
      const pattern = { attr1: '$.attr1', attr2: '£.attr1' };
      const result = transformationObjectV1.executeWithParams(source, pullParams, pattern);
      expect(result.attr1).toBe('value1');
      expect(result.attr2).toBe('value2');
    });

    test('should combine pull parameters with evaluation', () => {
      const source = { attr1: 'value1' };
      const pullParams = { attr1: 'value2' };
      const pattern = { attr1: "={$.attr1}+' '+{£.attr1}" };
      const result = transformationObjectV1.executeWithParams(source, pullParams, pattern);
      expect(result.attr1).toBe('value1 value2');
    });

    test('should handle complex pull parameter evaluation', () => {
      const source = { attr1: { attr2: 'value1' } };
      const pullParams = { attr1: 'attr2' };
      const pattern = { attr1: '={$.attr1}[{£.attr1}]' };
      const result = transformationObjectV1.executeWithParams(source, pullParams, pattern);
      expect(result.attr1).toBe('value1');
    });
  });
});

describe('Object Transformation V2', () => {
  describe('Simple mapping', () => {
    test('should map simple property', () => {
      const source = { attr1: 'value1' };
      const pattern = { attr2: '$.attr1' };
      const result = transformationObjectV2.executeWithParams(source, undefined, pattern);
      expect(result.attr2).toBe('value1');
    });

    test('should handle numeric values', () => {
      const source = { attr1: 999 };
      const pattern = { attr2: '$.attr1' };
      const result = transformationObjectV2.executeWithParams(source, undefined, pattern);
      expect(result.attr2).toBe(999);
    });
  });

  describe('Dot property access', () => {
    test('should access nested properties', () => {
      const source = { attr1: { attr2: 'value1' } };
      const pattern = { attr3: '$.attr1.attr2' };
      const result = transformationObjectV2.executeWithParams(source, undefined, pattern);
      expect(result.attr3).toBe('value1');
    });
  });

  describe('Evaluation expressions', () => {
    test('should evaluate array operations', () => {
      const source = [1, 2, 3, 4, 5];
      const pattern = { attr1: '={$..}.map(r=>r*2)' };
      const result = transformationObjectV2.executeWithParams(source, undefined, pattern);
      expect(result.attr1).toStrictEqual([2, 4, 6, 8, 10]);
    });
  });

  describe('Pull parameters', () => {
    test('should handle complex pull parameter evaluation', () => {
      const source = { attr1: { attr2: 'value1' } };
      const pullParams = { attr1: 'attr2' };
      const pattern = { attr1: '={$.attr1}[{£.attr1}]' };
      const result = transformationObjectV2.executeWithParams(source, pullParams, pattern);
      expect(result.attr1).toBe('value1');
    });
  });
});