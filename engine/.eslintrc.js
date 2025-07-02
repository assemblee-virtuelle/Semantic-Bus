module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    // Erreurs importantes
    'no-console': 'off', // Autorisé car c'est un serveur
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-undef': 'warn', // Changé en warning
    
    // Style de code
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['warn', 'single'], // Changé en warning
    'semi': ['warn', 'always'], // Changé en warning
    
    // Bonnes pratiques
    'eqeqeq': 'warn', // Changé en warning
    'no-eval': 'warn', // Changé en warning
    'no-implied-eval': 'warn',
    'no-new-func': 'warn',
    'no-script-url': 'warn',
    'no-empty': 'warn', // Ajouté en warning
    'no-useless-escape': 'warn', // Ajouté en warning
    
    // Variables
    'no-delete-var': 'error',
    'no-label-var': 'error',
    'no-shadow': 'warn',
    'no-shadow-restricted-names': 'error',
    'no-use-before-define': 'warn', // Changé en warning
    'no-redeclare': 'warn', // Ajouté en warning
    
    // ES6
    'arrow-spacing': 'warn',
    'no-confusing-arrow': 'warn',
    'no-duplicate-imports': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'prefer-arrow-callback': 'warn'
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-unused-expressions': 'off'
      }
    }
  ]
};