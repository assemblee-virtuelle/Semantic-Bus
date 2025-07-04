# Mocks pour les Dépendances Externes

Ce répertoire contient les mocks pour les dépendances externes d'infrastructure qui ne doivent pas être utilisées dans les tests unitaires et d'intégration.

## Dépendances Mockées

### 🗄️ Bases de Données
- **mongoose.js** - Mock de MongoDB ORM
- **cassandra-driver.js** - Mock de Cassandra/Scylla driver
- **@aws-sdk/client-dynamodb.js** - Mock du client DynamoDB AWS
- **@aws-sdk/lib-dynamodb.js** - Mock du document client DynamoDB

### 🔐 Authentification OAuth (appels externes)
- **passport.js** - Mock de Passport.js (stratégies d'authentification)
- **passport-google-oauth.js** - Mock pour OAuth Google

### 📧 Communication
- **imap.js** - Mock pour IMAP client
- **node-imap.js** - Alias vers le mock IMAP

## Configuration Jest

Les mocks sont automatiquement utilisés grâce à la configuration dans `jest.config.js` :

```javascript
moduleNameMapper: {
  '^@semantic-bus/core/(.*)$': '<rootDir>/$1',
  '^mongoose$': '<rootDir>/__mocks__/mongoose.js',
  '^cassandra-driver$': '<rootDir>/__mocks__/cassandra-driver.js',
  '^passport$': '<rootDir>/__mocks__/passport.js',
  // ... autres mocks
}
```

## Utilisation

### Dans les Tests

Les mocks sont transparents - utilisez les dépendances normalement :

```javascript
// Utilise automatiquement le mock
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Ces appels utilisent les versions mockées
const hash = await bcrypt.hash('password', 10);
const model = mongoose.model('Test', new mongoose.Schema({}));
```

### Import du Module Core

Vous pouvez importer le module core et ses dépendances sans problème :

```javascript
// Import direct des helpers
const ArraySegmentator = require('@semantic-bus/core/helpers/ArraySegmentator');

// Import des librairies (utilisent les mocks pour les dépendances externes)
const authLib = require('@semantic-bus/core/lib/auth_lib');
const dataTraitment = require('@semantic-bus/core/dataTraitmentLibrary');
```

## Fonctionnalités des Mocks

### Mongoose Mock
- Simule les modèles, requêtes et connexions
- Retourne des promesses résolues avec des données de test
- Génère des IDs mockés (`mock-id-xxxxx`)

### Cassandra Mock
- Simule le client et les connexions
- Retourne des résultats vides pour les requêtes
- Pas de vraie connexion réseau

### AWS SDK Mocks
- Simulent les clients DynamoDB
- Retournent des réponses mockées pour toutes les commandes
- Pas de connexion AWS réelle

### Auth Mocks
- JWT : génère des tokens de test et decode avec des payloads mockés
- BCrypt : hash/compare avec des valeurs de test prévisibles
- Passport : stratégies mockées sans vraie authentification OAuth

## Tests d'Exemple

Voir `__tests__/integration/core-dependencies.test.js` pour des exemples d'utilisation des mocks avec le module core.

## Ajout de Nouveaux Mocks

Pour ajouter un nouveau mock :

1. Créer le fichier mock dans `__mocks__/`
2. Ajouter la configuration dans `jest.config.js`
3. Tester l'import et l'utilisation

```javascript
// Exemple de nouveau mock
module.exports = {
  // Simuler les méthodes principales
  connect: jest.fn(() => Promise.resolve()),
  disconnect: jest.fn(() => Promise.resolve()),
  // ... autres méthodes
};
``` 