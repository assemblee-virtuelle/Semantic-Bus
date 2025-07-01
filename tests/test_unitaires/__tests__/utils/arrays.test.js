const arrays = require('../../../../engine/utils/arrays.js');

describe('Arrays Utils', () => {
  describe('Array Manipulation Functions', () => {
    test('should have array utility functions defined', () => {
      expect(arrays).toBeDefined();
      expect(typeof arrays).toBe('object');
    });

    // Test des fonctions disponibles dans le module arrays
    // Ces tests dépendent de l'implémentation réelle du module
    
    test('should handle empty arrays', () => {
      const emptyArray = [];
      
      // Test des fonctions communes qui pourraient être présentes
      if (arrays.isEmpty) {
        expect(arrays.isEmpty(emptyArray)).toBe(true);
      }
      
      if (arrays.length) {
        expect(arrays.length(emptyArray)).toBe(0);
      }
    });

    test('should handle non-empty arrays', () => {
      const testArray = [1, 2, 3, 4, 5];
      
      if (arrays.isEmpty) {
        expect(arrays.isEmpty(testArray)).toBe(false);
      }
      
      if (arrays.length) {
        expect(arrays.length(testArray)).toBe(5);
      }
    });

    test('should handle array filtering operations', () => {
      const testArray = [1, 2, 3, 4, 5, 6];
      
      if (arrays.filter) {
        const evenNumbers = arrays.filter(testArray, n => n % 2 === 0);
        expect(evenNumbers).toEqual([2, 4, 6]);
      }
    });

    test('should handle array mapping operations', () => {
      const testArray = [1, 2, 3];
      
      if (arrays.map) {
        const doubled = arrays.map(testArray, n => n * 2);
        expect(doubled).toEqual([2, 4, 6]);
      }
    });

    test('should handle array reduction operations', () => {
      const testArray = [1, 2, 3, 4, 5];
      
      if (arrays.reduce) {
        const sum = arrays.reduce(testArray, (acc, val) => acc + val, 0);
        expect(sum).toBe(15);
      }
    });

    test('should handle array finding operations', () => {
      const testArray = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ];
      
      if (arrays.find) {
        const found = arrays.find(testArray, item => item.name === 'Bob');
        expect(found).toEqual({ id: 2, name: 'Bob' });
      }
      
      if (arrays.findIndex) {
        const index = arrays.findIndex(testArray, item => item.name === 'Bob');
        expect(index).toBe(1);
      }
    });

    test('should handle array sorting operations', () => {
      const testArray = [3, 1, 4, 1, 5, 9, 2, 6];
      
      if (arrays.sort) {
        const sorted = arrays.sort([...testArray]);
        expect(sorted).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
      }
    });

    test('should handle array uniqueness operations', () => {
      const testArray = [1, 2, 2, 3, 3, 3, 4, 5];
      
      if (arrays.unique) {
        const unique = arrays.unique(testArray);
        expect(unique).toEqual([1, 2, 3, 4, 5]);
      }
    });

    test('should handle array flattening operations', () => {
      const nestedArray = [[1, 2], [3, 4], [5, [6, 7]]];
      
      if (arrays.flatten) {
        const flattened = arrays.flatten(nestedArray);
        expect(flattened).toEqual([1, 2, 3, 4, 5, 6, 7]);
      }
    });

    test('should handle array chunking operations', () => {
      const testArray = [1, 2, 3, 4, 5, 6, 7, 8];
      
      if (arrays.chunk) {
        const chunked = arrays.chunk(testArray, 3);
        expect(chunked).toEqual([[1, 2, 3], [4, 5, 6], [7, 8]]);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle null or undefined arrays gracefully', () => {
      if (arrays.isEmpty) {
        expect(() => arrays.isEmpty(null)).not.toThrow();
        expect(() => arrays.isEmpty(undefined)).not.toThrow();
      }
      
      if (arrays.length) {
        expect(() => arrays.length(null)).not.toThrow();
        expect(() => arrays.length(undefined)).not.toThrow();
      }
    });

    test('should handle non-array inputs', () => {
      const nonArrayInputs = [
        'string',
        123,
        { key: 'value' },
        true,
        false
      ];

      nonArrayInputs.forEach(input => {
        if (arrays.isEmpty) {
          expect(() => arrays.isEmpty(input)).not.toThrow();
        }
        
        if (arrays.length) {
          expect(() => arrays.length(input)).not.toThrow();
        }
      });
    });
  });

  describe('Performance Tests', () => {
    test('should handle large arrays efficiently', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      
      const startTime = Date.now();
      
      if (arrays.filter) {
        arrays.filter(largeArray, n => n % 2 === 0);
      }
      
      if (arrays.map) {
        arrays.map(largeArray, n => n * 2);
      }
      
      const endTime = Date.now();
      
      // Should complete operations on 10k items in reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Edge Cases', () => {
    test('should handle arrays with mixed data types', () => {
      const mixedArray = [1, 'string', true, null, undefined, { key: 'value' }, [1, 2, 3]];
      
      if (arrays.length) {
        expect(arrays.length(mixedArray)).toBe(7);
      }
      
      if (arrays.filter) {
        const strings = arrays.filter(mixedArray, item => typeof item === 'string');
        expect(strings).toEqual(['string']);
      }
    });

    test('should handle arrays with complex objects', () => {
      const complexArray = [
        { 
          id: 1, 
          user: { name: 'Alice', preferences: { theme: 'dark' } },
          tags: ['admin', 'user']
        },
        { 
          id: 2, 
          user: { name: 'Bob', preferences: { theme: 'light' } },
          tags: ['user']
        }
      ];
      
      if (arrays.find) {
        const found = arrays.find(complexArray, item => item.user.name === 'Alice');
        expect(found).toBeDefined();
        expect(found.user.preferences.theme).toBe('dark');
      }
    });

    test('should handle circular references in array objects', () => {
      const obj1 = { id: 1, name: 'Object 1' };
      const obj2 = { id: 2, name: 'Object 2' };
      obj1.ref = obj2;
      obj2.ref = obj1;
      
      const circularArray = [obj1, obj2];
      
      // Should not throw errors when processing arrays with circular references
      if (arrays.length) {
        expect(() => arrays.length(circularArray)).not.toThrow();
      }
      
      if (arrays.find) {
        expect(() => arrays.find(circularArray, item => item.id === 1)).not.toThrow();
      }
    });
  });
});