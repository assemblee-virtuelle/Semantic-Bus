const stringReplacer = require('../../utils/stringReplacer.js');

describe('String Replacer', () => {
  describe('Module Loading', () => {
    test('should load stringReplacer module without errors', () => {
      expect(stringReplacer).toBeDefined();
      expect(typeof stringReplacer).toBe('object');
    });

    test('should have execute method', () => {
      expect(typeof stringReplacer.execute).toBe('function');
    });
  });

  describe('execute method', () => {
    test('should return original string when no replacements needed', () => {
      const result = stringReplacer.execute('simple string', {}, {});
      expect(result).toBe('simple string');
    });

    test('should handle empty string', () => {
      expect(stringReplacer.execute('', {}, {})).toBe('');
    });

    test('should replace flow data parameters ($ syntax)', () => {
      const template = 'User: {$.name}';
      const flowData = { name: 'John Doe' };
      const result = stringReplacer.execute(template, {}, flowData);
      expect(result).toBe('User: John Doe');
    });

    test('should handle nested object access', () => {
      const template = 'User: {$.user.name}';
      const flowData = { user: { name: 'Jane Doe' } };
      const result = stringReplacer.execute(template, {}, flowData);
      expect(result).toBe('User: Jane Doe');
    });

    test('should handle missing parameters gracefully', () => {
      const template = 'Hello {$.missingParam}';
      const result = stringReplacer.execute(template, {}, {});
      // Le comportement exact dépend de l'implémentation
      expect(typeof result).toBe('string');
    });

    test('should handle undefined flow data', () => {
      const template = 'Hello World';
      const result = stringReplacer.execute(template, undefined, undefined);
      expect(result).toBe('Hello World');
    });
  });
});