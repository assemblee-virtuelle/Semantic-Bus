const transformationObjectV1 = require('../../../../engine/utils/objectTransformation.js');
const transformationObjectV2 = require('../../../../engine/utils/objectTransformationV2.js');

describe('Object Transformation Utils', () => {
  describe('Version 1 (objectTransformation.js)', () => {
    describe('Basic Mapping', () => {
      test('should perform simple mapping', () => {
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

      test('should handle boolean values', () => {
        const source = { attr1: true };
        const pattern = { attr2: '$.attr1' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.attr2).toBe(true);
      });

      test('should handle null values', () => {
        const source = { attr1: null };
        const pattern = { attr2: '$.attr1' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.attr2).toBeUndefined();
      });
    });

    describe('Nested Object Access', () => {
      test('should access nested properties with dot notation', () => {
        const source = { attr1: { attr2: 'value1' } };
        const pattern = { attr3: '$.attr1.attr2' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.attr3).toBe('value1');
      });

      test('should handle deeply nested objects', () => {
        const source = { 
          level1: { 
            level2: { 
              level3: { 
                value: 'deep_value' 
              } 
            } 
          } 
        };
        const pattern = { result: '$.level1.level2.level3.value' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.result).toBe('deep_value');
      });
    });

    describe('Embedded Patterns', () => {
      test('should handle embedded pattern structures', () => {
        const source = { attr1: 'value1' };
        const pattern = { attr2: { attr3: '$.attr1' } };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.attr2.attr3).toBe('value1');
      });

      test('should handle complex embedded structures', () => {
        const source = { 
          user: { name: 'John', age: 30 },
          city: 'Paris'
        };
        const pattern = { 
          profile: { 
            userName: '$.user.name',
            userAge: '$.user.age',
            location: '$.city'
          }
        };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.profile.userName).toBe('John');
        expect(result.profile.userAge).toBe(30);
        expect(result.profile.location).toBe('Paris');
      });
    });

    describe('Array Handling', () => {
      test('should handle root array access', () => {
        const source = [{ attr1: 'value1' }, { attr1: 'value2' }];
        const pattern = { attr2: '$..' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.attr2).toStrictEqual(source);
      });

      test('should handle array element access', () => {
        const source = { items: ['first', 'second', 'third'] };
        const pattern = { firstItem: '$.items[0]' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.firstItem).toBe('first');
      });
    });

    describe('Fixed Values', () => {
      test('should handle fixed string values', () => {
        const source = { attr1: 'value1' };
        const pattern = { attr2: 'fixed_value' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.attr2).toBe('fixed_value');
      });

      test('should handle fixed numeric values', () => {
        const source = { attr1: 'value1' };
        const pattern = { attr2: 42 };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.attr2).toBe(42);
      });
    });

    describe('Evaluation Expressions', () => {
      test('should handle simple evaluation', () => {
        const source = { attr1: 'value1' };
        const pattern = { attr2: '={$.attr1}' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.attr2).toBe('value1');
      });

      test('should handle string concatenation in evaluation', () => {
        const source = { attr1: 'value1', attr2: 'value2' };
        const pattern = { result: "={$.attr1}+' '+{$.attr2}" };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.result).toBe('value1 value2');
      });

      test('should handle mathematical operations', () => {
        const source = { num1: 10, num2: 5 };
        const pattern = { 
          sum: '={$.num1}+{$.num2}',
          product: '={$.num1}*{$.num2}',
          difference: '={$.num1}-{$.num2}'
        };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.sum).toBe(15);
        expect(result.product).toBe(50);
        expect(result.difference).toBe(5);
      });

      test('should handle array operations in evaluation', () => {
        const source = [1, 2, 3, 4, 5];
        const pattern = { doubled: '={$..}.map(r=>r*2)' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.doubled).toStrictEqual([2, 4, 6, 8, 10]);
      });
    });

    describe('Pull Parameters', () => {
      test('should handle pull parameters with £ notation', () => {
        const source = { attr1: 'value1' };
        const pullParams = { attr1: 'value2' };
        const pattern = { 
          sourceValue: '$.attr1',
          paramValue: '£.attr1'
        };
        const result = transformationObjectV1.executeWithParams(source, pullParams, pattern);
        expect(result.sourceValue).toBe('value1');
        expect(result.paramValue).toBe('value2');
      });

      test('should combine source and pull params in evaluation', () => {
        const source = { attr1: 'value1' };
        const pullParams = { attr1: 'value2' };
        const pattern = { combined: "={$.attr1}+' '+{£.attr1}" };
        const result = transformationObjectV1.executeWithParams(source, pullParams, pattern);
        expect(result.combined).toBe('value1 value2');
      });

      test('should use pull params for dynamic property access', () => {
        const source = { attr1: { attr2: 'value1' } };
        const pullParams = { attr1: 'attr2' };
        const pattern = { result: '={$.attr1}[{£.attr1}]' };
        const result = transformationObjectV1.executeWithParams(source, pullParams, pattern);
        expect(result.result).toBe('value1');
      });
    });

    describe('Error Handling', () => {
      test('should handle undefined source properties gracefully', () => {
        const source = { attr1: 'value1' };
        const pattern = { result: '$.nonExistent' };
        const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
        expect(result.result).toBeUndefined();
      });

      test('should handle invalid evaluation expressions gracefully', () => {
        const source = { attr1: 'value1' };
        const pattern = { result: '={invalid_expression}' };
        expect(() => {
          const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
          expect(result).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('Version 2 (objectTransformationV2.js)', () => {
    describe('Compatibility with V1', () => {
      test('should maintain compatibility for simple mapping', () => {
        const source = { attr1: 'value1' };
        const pattern = { attr2: '$.attr1' };
        const resultV1 = transformationObjectV1.executeWithParams(source, undefined, pattern);
        const resultV2 = transformationObjectV2.executeWithParams(source, undefined, pattern);
        expect(resultV2).toEqual(resultV1);
      });

      test('should maintain compatibility for nested access', () => {
        const source = { attr1: { attr2: 'value1' } };
        const pattern = { attr3: '$.attr1.attr2' };
        const resultV1 = transformationObjectV1.executeWithParams(source, undefined, pattern);
        const resultV2 = transformationObjectV2.executeWithParams(source, undefined, pattern);
        expect(resultV2).toEqual(resultV1);
      });

      test('should maintain compatibility for evaluation', () => {
        const source = { attr1: 'value1', attr2: 'value2' };
        const pattern = { result: "={$.attr1}+' '+{$.attr2}" };
        const resultV1 = transformationObjectV1.executeWithParams(source, undefined, pattern);
        const resultV2 = transformationObjectV2.executeWithParams(source, undefined, pattern);
        expect(resultV2).toEqual(resultV1);
      });

      test('should maintain compatibility for pull parameters', () => {
        const source = { attr1: 'value1' };
        const pullParams = { attr1: 'value2' };
        const pattern = { 
          sourceValue: '$.attr1',
          paramValue: '£.attr1'
        };
        const resultV1 = transformationObjectV1.executeWithParams(source, pullParams, pattern);
        const resultV2 = transformationObjectV2.executeWithParams(source, pullParams, pattern);
        expect(resultV2).toEqual(resultV1);
      });
    });

    describe('V2 Specific Features', () => {
      test('should handle large objects efficiently', () => {
        const source = {
          items: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item${i}` }))
        };
        const pattern = { 
          count: '={$.items}.length',
          totalItems: '$.items'
        };
        
        const startTime = Date.now();
        const result = transformationObjectV2.executeWithParams(source, undefined, pattern);
        const endTime = Date.now();
        
        expect(result.count).toBe(1000);
        expect(result.totalItems).toBeDefined();
        expect(Array.isArray(result.totalItems)).toBe(true);
        expect(result.totalItems.length).toBe(1000);
        expect(endTime - startTime).toBeLessThan(100);
      });
    });
  });

  describe('Performance Comparison', () => {
    test('should perform transformations in reasonable time', () => {
      const source = {
        users: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `User${i}`,
          email: `user${i}@example.com`
        }))
      };
      const pattern = {
        userList: '={$.users}.map(u => ({id: u.id, displayName: u.name + " <" + u.email + ">"}))'
      };

      const startV1 = Date.now();
      const resultV1 = transformationObjectV1.executeWithParams(source, undefined, pattern);
      const timeV1 = Date.now() - startV1;

      const startV2 = Date.now();
      const resultV2 = transformationObjectV2.executeWithParams(source, undefined, pattern);
      const timeV2 = Date.now() - startV2;

      expect(resultV1.userList).toHaveLength(100);
      expect(resultV2.userList).toHaveLength(100);
      expect(timeV1).toBeLessThan(1000);
      expect(timeV2).toBeLessThan(1000);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty objects', () => {
      const source = {};
      const pattern = { result: '$.nonExistent' };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.result).toBeUndefined();
    });

    test('should handle empty arrays', () => {
      const source = [];
      const pattern = { result: '$..' };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.result).toEqual([]);
    });

    test('should handle complex nested structures', () => {
      const source = {
        data: {
          users: [
            { profile: { settings: { theme: 'dark' } } },
            { profile: { settings: { theme: 'light' } } }
          ]
        }
      };
      const pattern = {
        themes: '={$.data.users}.map(u => u.profile.settings.theme)'
      };
      const result = transformationObjectV1.executeWithParams(source, undefined, pattern);
      expect(result.themes).toEqual(['dark', 'light']);
    });
  });
});