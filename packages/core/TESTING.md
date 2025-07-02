# Guide des Tests - @semantic-bus/core

Ce guide explique comment utiliser le module `@semantic-bus/core` dans les tests avec les mocks configurés pour les dépendances externes.

## 🎯 Objectif

Les tests peuvent utiliser `@semantic-bus/core` et toutes ses dépendances, mais les éléments d'infrastructure externe (AMQP, MongoDB, Cassandra, IMAP...) sont automatiquement mockés.

## 🔧 Configuration Automatique

La configuration Jest est déjà configurée avec :

```javascript
moduleNameMapper: {
  // Import du module core
  '^@semantic-bus/core/(.*)$': '<rootDir>/$1',
  
  // Mocks des dépendances externes
  '^mongoose$': '<rootDir>/__mocks__/mongoose.js',
  '^cassandra-driver$': '<rootDir>/__mocks__/cassandra-driver.js',
  '^@aws-sdk/client-dynamodb$': '<rootDir>/__mocks__/@aws-sdk/client-dynamodb.js',
  '^@aws-sdk/lib-dynamodb$': '<rootDir>/__mocks__/@aws-sdk/lib-dynamodb.js',
  '^passport$': '<rootDir>/__mocks__/passport.js',
  '^passport-google-oauth$': '<rootDir>/__mocks__/passport-google-oauth.js',
  '^jwt-simple$': '<rootDir>/__mocks__/jwt-simple.js',
  '^bcryptjs$': '<rootDir>/__mocks__/bcryptjs.js',
  '^imap$': '<rootDir>/__mocks__/imap.js',
  '^node-imap$': '<rootDir>/__mocks__/node-imap.js'
}
```

## 📝 Exemples d'Utilisation

### Import des Helpers

```javascript
// Import direct des utilitaires
const ArraySegmentator = require('@semantic-bus/core/helpers/ArraySegmentator');
const DfobHelper = require('@semantic-bus/core/helpers/dfobHelper');
const literalHelpers = require('@semantic-bus/core/helpers/literalHelpers');

// Utilisation normale
const segmentator = new ArraySegmentator();
const result = segmentator.segment([1, 2, 3, 4, 5], 2);
// result: [[1, 2], [3, 4], [5]]
```

### Import des Librairies de Traitement de Données

```javascript
// Import de la librairie de traitement
const dataTraitment = require('@semantic-bus/core/dataTraitmentLibrary');

// Les conversions fonctionnent normalement
const csvModule = require('@semantic-bus/core/dataTraitmentLibrary/csv/csv_traitment');
const excelModule = require('@semantic-bus/core/dataTraitmentLibrary/exel/exel_traitment');
```

### Import des Librairies Métier

```javascript
// Les librairies utilisent automatiquement les mocks
const authLib = require('@semantic-bus/core/lib/auth_lib');
const userLib = require('@semantic-bus/core/lib/user_lib');
const fragmentLib = require('@semantic-bus/core/lib/fragment_lib_scylla');

// Les méthodes sont disponibles mais utilisent des mocks
expect(authLib.create).toBeDefined();
expect(userLib._create).toBeDefined();
```

## 🧪 Test des Mocks

### Mongoose (MongoDB)

```javascript
const mongoose = require('mongoose');

// Création d'un modèle
const TestModel = mongoose.model('Test', new mongoose.Schema({
  name: String
}));

// Utilisation mockée
const instance = new TestModel({ name: 'test' });
expect(instance._id).toMatch(/^mock-id-/);

// Requêtes mockées
const result = await TestModel.findOne({ name: 'test' });
// result sera null (comportement par défaut du mock)
```

### Cassandra

```javascript
const cassandra = require('cassandra-driver');

// Client mocké
const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1'
});

// Connexion mockée (pas de vraie connexion)
await client.connect();

// Requêtes mockées
const result = await client.execute('SELECT * FROM table');
// result: { rows: [], rowLength: 0 }
```

### AWS DynamoDB

```javascript
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

// Client mocké
const client = new DynamoDBClient({});

// Commandes mockées
const result = await client.send(new ListTablesCommand({}));
// result: { TableNames: ['mock-table'] }
```

### Librairies Computationnelles (NON mockées)

```javascript
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');

// JWT - fonctionne normalement (pas de mock)
const payload = { user: 'test', exp: Math.floor(Date.now() / 1000) + 3600 };
const token = jwt.encode(payload, 'secret');
expect(typeof token).toBe('string');

const decoded = jwt.decode(token, 'secret');
expect(decoded.user).toBe('test');

// BCrypt - fonctionne normalement (pas de mock)
const hash = await bcrypt.hash('password', 1);
expect(typeof hash).toBe('string');

const isValid = await bcrypt.compare('password', hash);
expect(isValid).toBe(true);
```

## 🏃‍♂️ Lancer les Tests

```bash
# Tests du module core
npm test

# Test spécifique
npm test -- __tests__/integration/core-dependencies.test.js

# Tests avec verbose
npm test -- --verbose

# Tests avec coverage
npm test -- --coverage
```

## 📁 Structure des Tests

```
packages/core/
├── __tests__/
│   ├── helpers/
│   │   └── ArraySegmentator.test.js
│   └── integration/
│       └── core-dependencies.test.js
├── __mocks__/
│   ├── mongoose.js
│   ├── cassandra-driver.js
│   ├── @aws-sdk/
│   │   ├── client-dynamodb.js
│   │   └── lib-dynamodb.js
│   ├── passport.js
│   ├── passport-google-oauth.js
│   ├── jwt-simple.js
│   ├── bcryptjs.js
│   ├── imap.js
│   └── node-imap.js
└── jest.config.js
```

## 🔍 Comportement des Mocks

### 🗄️ Bases de Données (Mockées)
- **MongoDB/Mongoose** : Retourne des objets vides ou null
- **Cassandra** : Retourne des résultats vides
- **DynamoDB** : Retourne des réponses AWS mockées

### 🔐 OAuth (Mocké)
- **Passport** : Stratégies mockées sans vraie authentification OAuth

### 📧 Communication (Mockée)
- **IMAP** : Clients mockés avec événements simulés

### ✅ Librairies Computationnelles (PAS mockées)
- **JWT-simple** : Fonctionne normalement - pas d'infrastructure externe
- **BCrypt** : Fonctionne normalement - juste du hachage cryptographique

## 🚨 Bonnes Pratiques

1. **Utilisation transparente** : Les mocks sont transparents, utilisez les dépendances normalement
2. **Tests isolés** : Chaque test est isolé, pas d'état partagé
3. **Données prévisibles** : Les mocks retournent des données prévisibles pour les assertions
4. **Pas de side effects** : Aucune vraie connexion ou modification externe

## 🛠️ Extension pour Autres Modules

Pour utiliser cette configuration dans d'autres modules (engine, main, timer) :

```bash
# Depuis le répertoire core
node copy-mocks-to-other-modules.js
```

Ou ajoutez manuellement dans le `jest.config.js` de chaque module :

```javascript
moduleNameMapper: {
  // Références aux mocks du module core
  '^mongoose$': '<rootDir>/../core/__mocks__/mongoose.js',
  '^cassandra-driver$': '<rootDir>/../core/__mocks__/cassandra-driver.js',
  // ... autres mocks
}
```

## 📖 Documentation Complète

Voir `__mocks__/README.md` pour les détails de chaque mock et leurs fonctionnalités. 