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

      // Style de code (rules similaires à standard mais en warnings)
      'indent': ['warn', 2],
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'comma-dangle': ['warn', 'never'],
      'space-before-blocks': 'warn',
      'space-before-function-paren': ['warn', 'never'],
      'object-curly-spacing': ['warn', 'always'],
      'arrow-spacing': 'warn',
      'key-spacing': 'warn',
      'comma-spacing': 'warn',
      'no-trailing-spaces': 'warn',
      'eol-last': 'warn',
      'no-multiple-empty-lines': ['warn', { max: 2 }],
      'padded-blocks': ['warn', 'never'],
      'spaced-comment': 'warn',

      // Bonnes pratiques
      'eqeqeq': 'warn',
      'no-eval': 'warn',
      'no-implied-eval': 'warn',
      'no-new-func': 'warn',
      'no-script-url': 'warn',
      'no-empty': 'warn',
      'no-useless-escape': 'warn',
      'no-useless-constructor': 'warn',
      'camelcase': 'warn',
      'new-cap': 'warn',
      'no-unused-expressions': 'warn',
      'no-template-curly-in-string': 'warn',
      'no-sequences': 'warn',
      'no-new': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-multi-spaces': 'warn',
      'space-infix-ops': 'warn',

      // Variables
      'no-delete-var': 'error',
      'no-label-var': 'error',
      'no-shadow': 'warn',
      'no-shadow-restricted-names': 'error',
      'no-use-before-define': 'warn',
      'no-redeclare': 'warn',

      // ES6
      'no-confusing-arrow': 'warn',
      'no-duplicate-imports': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '__tests__/**',
      '__mocks__/**',
      '**/*.test.js',
      '**/*.spec.js'
    ]
  }
];
