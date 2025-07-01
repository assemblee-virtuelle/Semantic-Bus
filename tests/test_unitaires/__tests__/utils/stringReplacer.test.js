const stringReplacer = require('../../../../engine/utils/stringReplacer.js');

describe('String Replacer Utils', () => {
  describe('Basic String Replacement', () => {
    test('should replace simple variables in string', () => {
      const template = 'Hello {name}!';
      const queryParams = { name: 'World' };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('Hello World!');
    });

    test('should handle multiple variables', () => {
      const template = '{greeting} {name}, welcome to {place}!';
      const queryParams = { 
        greeting: 'Hello',
        name: 'John',
        place: 'Paris'
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('Hello John, welcome to Paris!');
    });

    test('should handle variables with no replacement available', () => {
      const template = 'Hello {name}!';
      const queryParams = {};
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('Hello {name}!'); // Should keep original if no replacement
    });

    test('should handle empty string', () => {
      const template = '';
      const queryParams = { name: 'World' };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('');
    });

    test('should handle string with no variables', () => {
      const template = 'Hello World!';
      const queryParams = { name: 'John' };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('Hello World!');
    });
  });

  describe('Data Context Replacement', () => {
    test('should replace variables using data context when queryParams is undefined', () => {
      const template = 'User: {user.name}';
      const queryParams = undefined;
      const data = { user: { name: 'Alice' } };
      const result = stringReplacer.execute(template, queryParams, data);
      expect(result).toBe('User: Alice');
    });

    test('should prefer queryParams over data context', () => {
      const template = 'Name: {name}';
      const queryParams = { name: 'FromParams' };
      const data = { name: 'FromData' };
      const result = stringReplacer.execute(template, queryParams, data);
      expect(result).toBe('Name: FromParams');
    });

    test('should fallback to data context when queryParams missing key', () => {
      const template = 'Hello {name}, age: {age}';
      const queryParams = { name: 'John' };
      const data = { age: 25 };
      const result = stringReplacer.execute(template, queryParams, data);
      expect(result).toBe('Hello John, age: 25');
    });
  });

  describe('Nested Property Access', () => {
    test('should handle nested properties in queryParams', () => {
      const template = 'User: {user.profile.name}';
      const queryParams = { 
        user: { 
          profile: { 
            name: 'John Doe' 
          } 
        } 
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('User: John Doe');
    });

    test('should handle nested properties in data context', () => {
      const template = 'Address: {address.street}, {address.city}';
      const queryParams = undefined;
      const data = { 
        address: { 
          street: '123 Main St',
          city: 'New York'
        } 
      };
      const result = stringReplacer.execute(template, queryParams, data);
      expect(result).toBe('Address: 123 Main St, New York');
    });

    test('should handle deeply nested properties', () => {
      const template = 'Value: {level1.level2.level3.value}';
      const queryParams = {
        level1: {
          level2: {
            level3: {
              value: 'deep_value'
            }
          }
        }
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('Value: deep_value');
    });
  });

  describe('Array Access', () => {
    test('should handle array index access', () => {
      const template = 'First item: {items.0}';
      const queryParams = { 
        items: ['first', 'second', 'third'] 
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('First item: first');
    });

    test('should handle nested array access', () => {
      const template = 'User name: {users.0.name}';
      const queryParams = { 
        users: [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 }
        ]
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('User name: Alice');
    });
  });

  describe('Special Characters and Edge Cases', () => {
    test('should handle variables with special characters in values', () => {
      const template = 'Message: {message}';
      const queryParams = { 
        message: 'Hello "World" & welcome to <app>!' 
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('Message: Hello "World" & welcome to <app>!');
    });

    test('should handle numeric values', () => {
      const template = 'Count: {count}, Price: {price}';
      const queryParams = { 
        count: 42,
        price: 19.99
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('Count: 42, Price: 19.99');
    });

    test('should handle boolean values', () => {
      const template = 'Active: {isActive}, Visible: {isVisible}';
      const queryParams = { 
        isActive: true,
        isVisible: false
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('Active: true, Visible: false');
    });

    test('should handle null and undefined values', () => {
      const template = 'Value1: {value1}, Value2: {value2}';
      const queryParams = { 
        value1: null,
        value2: undefined
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('Value1: null, Value2: undefined');
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle mixed replacement sources', () => {
      const template = 'Hello {user.name}, you have {notifications.count} new messages in {app.name}';
      const queryParams = { 
        user: { name: 'Alice' },
        app: { name: 'MyApp' }
      };
      const data = { 
        notifications: { count: 5 }
      };
      const result = stringReplacer.execute(template, queryParams, data);
      expect(result).toBe('Hello Alice, you have 5 new messages in MyApp');
    });

    test('should handle repeated variables', () => {
      const template = '{name} said: "Hello {name}!"';
      const queryParams = { name: 'John' };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('John said: "Hello John!"');
    });

    test('should handle variables at string boundaries', () => {
      const template = '{start}middle{end}';
      const queryParams = { 
        start: 'BEGIN-',
        end: '-END'
      };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('BEGIN-middle-END');
    });
  });

  describe('Error Handling', () => {
    test('should handle undefined template', () => {
      const template = undefined;
      const queryParams = { name: 'World' };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('');
    });

    test('should handle null template', () => {
      const template = null;
      const queryParams = { name: 'World' };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('');
    });

    test('should handle non-string template', () => {
      const template = 123;
      const queryParams = { name: 'World' };
      const result = stringReplacer.execute(template, queryParams);
      expect(result).toBe('123');
    });

    test('should handle undefined queryParams and data', () => {
      const template = 'Hello {name}!';
      const result = stringReplacer.execute(template, undefined, undefined);
      expect(result).toBe('Hello {name}!');
    });
  });
});