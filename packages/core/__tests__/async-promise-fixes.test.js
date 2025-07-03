const path = require('path');
const fs = require('fs');

describe('CORE Package - Async Promise Fixes', () => {

  describe('Anti-pattern Detection in Code Files', () => {
    test('fragment_lib.js should not use Promise constructor with async executor', () => {
      const filePath = path.join(__dirname, '../lib/fragment_lib.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Critical test: No async Promise executors
      expect(fileContent).not.toMatch(/new Promise\s*\(\s*async/);
    });

    test('error_lib.js should not use Promise constructor with async executor', () => {
      const filePath = path.join(__dirname, '../lib/error_lib.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Critical test: No async Promise executors
      expect(fileContent).not.toMatch(/new Promise\s*\(\s*async/);
    });

    test('file_convertor.js should not use Promise constructor with async executor', () => {
      const filePath = path.join(__dirname, '../dataTraitmentLibrary/file_convertor.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Critical test: No async Promise executors
      expect(fileContent).not.toMatch(/new Promise\s*\(\s*async/);
    });

    test('fragment_lib_scylla.js should not have duplicate keys', () => {
      const filePath = path.join(__dirname, '../lib/fragment_lib_scylla.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Should not have multiple PromiseOrchestrator definitions
      const promiseOrchestratorMatches = fileContent.match(/PromiseOrchestrator.*require/g);
      expect(promiseOrchestratorMatches).toBeTruthy();
      expect(promiseOrchestratorMatches.length).toBeLessThanOrEqual(1);
    });

    test('historiqueEnd_shema.js should not have duplicate keys', () => {
      const filePath = path.join(__dirname, '../model_schemas/historiqueEnd_shema.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Should not have multiple componentModule definitions
      const componentModuleMatches = fileContent.match(/componentModule\s*:/g);
      if (componentModuleMatches) {
        expect(componentModuleMatches.length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Function Structure Analysis', () => {
    test('fragment_lib.js functions should use async/await pattern', () => {
      const filePath = path.join(__dirname, '../lib/fragment_lib.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Should have async functions
      expect(fileContent).toMatch(/get:\s*async\s*function/);
      expect(fileContent).toMatch(/getWithResolution:\s*async\s*function/);
    });

    test('error_lib.js functions should use async/await pattern', () => {
      const filePath = path.join(__dirname, '../lib/error_lib.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Should have async functions
      expect(fileContent).toMatch(/create:\s*async\s*function/);
      expect(fileContent).toMatch(/getAll:\s*async\s*function/);
    });

    test('file_convertor.js should use async function instead of Promise constructor', () => {
      const filePath = path.join(__dirname, '../dataTraitmentLibrary/file_convertor.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Should have async function pattern for _data_from_file
      expect(fileContent).toMatch(/async\s+function.*_data_from_file|_data_from_file.*async/);
    });
  });

  describe('Code Quality Improvements', () => {
    test('should not have useless try/catch patterns in any file', () => {
      const files = [
        '../lib/fragment_lib.js',
        '../lib/error_lib.js',
        '../dataTraitmentLibrary/file_convertor.js'
      ];

      files.forEach(file => {
        const filePath = path.join(__dirname, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Should not have simple try/catch that just rethrows
        const uselessCatchPattern = /try\s*\{[^}]+\}\s*catch\s*\([^)]+\)\s*\{\s*throw\s+[^;]+;\s*\}/;
        expect(fileContent).not.toMatch(uselessCatchPattern);
      });
    });

    test('should use proper error handling patterns', () => {
      const files = [
        '../lib/fragment_lib.js',
        '../lib/error_lib.js'
      ];

      files.forEach(file => {
        const filePath = path.join(__dirname, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Should use await instead of .then()/.catch() chains in async functions
        const asyncFunctionWithThen = /async\s+function[^}]+\.then\s*\(/;
        expect(fileContent).not.toMatch(asyncFunctionWithThen);
      });
    });
  });

  describe('ESLint Rule Compliance', () => {
    test('should not trigger no-async-promise-executor rule', () => {
      const coreFiles = [
        '../lib/fragment_lib.js',
        '../lib/fragment_lib_scylla.js', 
        '../lib/error_lib.js',
        '../dataTraitmentLibrary/file_convertor.js'
      ];

      coreFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // No async Promise executors anywhere
          expect(fileContent).not.toMatch(/new Promise\s*\(\s*async/);
        }
      });
    });

    test('should not trigger no-dupe-keys rule', () => {
      const schemaFile = path.join(__dirname, '../model_schemas/historiqueEnd_shema.js');
      if (fs.existsSync(schemaFile)) {
        const fileContent = fs.readFileSync(schemaFile, 'utf8');
        
        // Check for specific duplicate key patterns we fixed
        const componentModuleMatches = fileContent.match(/componentModule\s*:/g);
        if (componentModuleMatches) {
          expect(componentModuleMatches.length).toBe(1);
        }
      }
    });
  });
}); 