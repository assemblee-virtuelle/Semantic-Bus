const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Browser globals for potential client-side code
        window: 'readonly',
        document: 'readonly',
        // ES6 globals
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      }
    },
    rules: {
      // Erreurs importantes
      'no-console': 'off', // Autorisé car c'est un serveur
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-undef': 'warn',
      
      // Style de code
      'indent': ['error', 2],
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      
      // Bonnes pratiques
      'eqeqeq': 'warn',
      'no-eval': 'warn',
      'no-implied-eval': 'warn',
      'no-new-func': 'warn',
      'no-script-url': 'warn',
      'no-empty': 'warn',
      'no-useless-escape': 'warn',
      
      // Variables
      'no-delete-var': 'error',
      'no-label-var': 'error',
      'no-shadow': 'warn',
      'no-shadow-restricted-names': 'error',
      'no-use-before-define': 'warn',
      'no-redeclare': 'warn',
      
      // ES6
      'arrow-spacing': 'warn',
      'no-confusing-arrow': 'warn',
      'no-duplicate-imports': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn'
    }
  },
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      'no-unused-expressions': 'off'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'build/**',
      '**/*.min.js'
    ]
  }
]; 