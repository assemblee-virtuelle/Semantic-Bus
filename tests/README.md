# Tests Structure

Ce répertoire contient uniquement la documentation sur l'infrastructure des tests pour le projet Semantic Bus.

## Structure des tests (Nouvelle Architecture)

Les tests sont maintenant organisés **par module** directement dans chaque module :

```
engine/
├── __tests__/              # Tests du moteur
│   ├── utils/              # Tests des utilitaires du moteur
│   ├── services/           # Tests des services du moteur
│   └── workspaceComponentExecutor/  # Tests des exécuteurs de composants
├── jest.config.js          # Configuration Jest pour le moteur
└── jest.setup.js           # Setup Jest pour le moteur

core/
├── __tests__/              # Tests du core (à créer selon les besoins)
├── jest.config.js          # Configuration Jest pour le core
└── jest.setup.js           # Setup Jest pour le core

main/
├── __tests__/              # Tests du main (à créer selon les besoins)
├── jest.config.js          # Configuration Jest pour le main
└── jest.setup.js           # Setup Jest pour le main

timer/
├── __tests__/              # Tests du timer (à créer selon les besoins)
├── jest.config.js          # Configuration Jest pour le timer
└── jest.setup.js           # Setup Jest pour le timer
```

## Principe de la nouvelle architecture

### 1. Isolation des modules
- Chaque module (`engine`, `core`, `main`, `timer`) a ses propres tests
- **Aucun test ne doit dépendre de plusieurs modules**
- Chaque module est testé indépendamment        

### 2. Configuration par module
- Chaque module a sa propre configuration Jest (`jest.config.js`)
- Chaque module a son propre setup Jest (`jest.setup.js`) avec ses mocks spécifiques
- Pas de `node_modules` de test dans git

## Exécution des tests

### Par module

```bash
# Tests du moteur
cd engine && npm test

# Tests du core
cd core && npm test

# Tests du main
cd main && npm test

# Tests du timer
cd timer && npm test
```

### Depuis la racine

```bash
# Tous les tests de tous les modules
npm run test:all

# Tests spécifiques par module
npm run test:engine
npm run test:core
npm run test:main
npm run test:timer
```

### Avec couverture

```bash
cd engine && npm run test:coverage
cd core && npm run test:coverage
cd main && npm run test:coverage
cd timer && npm run test:coverage
```

## Scripts disponibles

Chaque module dispose des scripts suivants dans son `package.json` :

- `npm test` : Exécuter les tests
- `npm run test:coverage` : Tests avec couverture
- `npm run test:watch` : Tests en mode watch
