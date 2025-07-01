# Tests Structure

Ce répertoire contient l'ensemble des tests pour le projet Semantic Bus.

## Structure des tests

```
tests/
├── test_unitaires/          # Tests unitaires existants
├── test_integrations/       # Tests d'intégration
│   ├── auth/               # Tests d'authentification
│   ├── user/               # Tests de gestion des utilisateurs
│   └── workspaces/         # Tests de gestion des workspaces
└── e2e/                    # Tests end-to-end avec CodeceptJS
```

## Types de tests

### 1. Tests unitaires (`test_unitaires/`)

Tests des fonctions individuelles et des modules isolés :
- Tests de transformation d'objets (V1 et V2)
- Tests des utilitaires
- Tests des composants du moteur

**Commande :** `npm run test:unit`

### 2. Tests d'intégration (`test_integrations/`)

Tests de l'interaction entre les différents modules :
- **auth/** : Tests du système d'authentification
- **user/** : Tests de la gestion des utilisateurs
- **workspaces/** : Tests de la gestion des workspaces

**Commandes :**
- `npm run test:integration` (tous)
- `npm run test:integration:auth`
- `npm run test:integration:user`
- `npm run test:integration:workspaces`

### 3. Tests end-to-end (`e2e/`)

Tests complets de l'application avec CodeceptJS :
- Tests de l'interface utilisateur
- Tests des workflows complets
- Tests avec navigateur

**Commande :** `npm run test:e2e`

## Tests du moteur (`engine/__tests__/`)

Tests spécifiques au moteur de traitement :
- Tests des utilitaires (`utils/`)
- Tests des services (`services/`)
- Tests des exécuteurs de composants (`workspaceComponentExecutor/`)

**Commande :** `npm run test:engine`

## Configuration

### Jest

Les tests utilisent Jest comme framework de test avec les configurations suivantes :
- `engine/jest.config.js` : Configuration pour les tests du moteur
- `engine/jest.setup.js` : Setup global pour les tests

### Coverage

La couverture de code est générée automatiquement et disponible dans :
- `engine/coverage/` : Rapports de couverture du moteur
- Rapports HTML disponibles dans `coverage/lcov-report/index.html`

## Exécution des tests

### Localement

```bash
# Installer toutes les dépendances
npm run install:all

# Exécuter tous les tests
npm test

# Exécuter des tests spécifiques
npm run test:unit
npm run test:engine
npm run test:integration
npm run test:e2e

# Avec couverture
cd engine && npm test -- --coverage
```

### En CI/CD

Les tests sont exécutés automatiquement via GitHub Actions :
- **Pull Requests** : Tests unitaires et linting
- **Push sur main/develop** : Tests complets (unitaires + intégration + e2e)

## Ajout de nouveaux tests

### Tests unitaires du moteur

Créer un fichier dans `engine/__tests__/` suivant la structure :
```
engine/__tests__/
├── utils/
│   └── nouveauModule.test.js
├── services/
│   └── nouveauService.test.js
└── workspaceComponentExecutor/
    └── nouveauComposant.test.js
```

### Tests d'intégration

Ajouter dans le répertoire approprié sous `test_integrations/` avec un `package.json` et des fichiers `.test.js`.

### Tests e2e

Ajouter des scénarios dans `e2e/acceptance/` en suivant la syntaxe CodeceptJS.

## Mocking

Les tests utilisent des mocks pour :
- Les dépendances externes (MongoDB, RabbitMQ)
- Les modules de fichiers
- Les appels HTTP
- La configuration

Voir `engine/jest.setup.js` pour les mocks globaux.

## Debugging

Pour déboguer les tests :
```bash
# Mode verbose
npm test -- --verbose

# Exécuter un test spécifique
npm test -- --testNamePattern="nom du test"

# Mode watch
npm test -- --watch
```

## Bonnes pratiques

1. **Isolation** : Chaque test doit être indépendant
2. **Mocking** : Mocker les dépendances externes
3. **Nommage** : Noms descriptifs pour les tests
4. **Coverage** : Viser une couverture élevée mais pertinente
5. **Performance** : Tests rapides et efficaces