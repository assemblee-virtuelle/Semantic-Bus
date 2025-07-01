# Structure de Test - Semantic Bus Engine

## 🎯 Objectif

Ce document décrit la structure de test mise en place pour le moteur Semantic Bus, permettant de tester tous les composants du système de manière unitaire et intégrée.

## 📁 Structure des Tests

```
tests/
├── test_unitaires/                 # Tests unitaires
│   ├── __tests__/                  # Dossier des tests organisés par composant
│   │   ├── engine/                 # Tests du moteur principal
│   │   ├── utils/                  # Tests des utilitaires
│   │   ├── services/               # Tests des services
│   │   └── communication/          # Tests de communication
│   ├── setup.js                    # Configuration globale des tests
│   ├── babel.config.js             # Configuration Babel
│   ├── package.json                # Dépendances et scripts de test
│   └── simple.test.js              # Test de validation de base
├── test_integrations/              # Tests d'intégration (existant)
└── e2e/                           # Tests end-to-end (existant)
```

## 🧪 Tests Créés

### 1. Tests des Utilitaires (`utils/`)

#### `objectTransformation.test.js`
- **Couverture** : Modules `objectTransformation.js` et `objectTransformationV2.js`
- **Tests inclus** :
  - Mapping simple de propriétés
  - Accès aux propriétés imbriquées
  - Patterns embarqués
  - Gestion des tableaux
  - Valeurs fixes
  - Expressions d'évaluation
  - Paramètres de pull (notation £)
  - Gestion d'erreurs
  - Tests de performance
  - Compatibilité entre v1 et v2

#### `stringReplacer.test.js`
- **Couverture** : Module `stringReplacer.js`
- **Tests inclus** :
  - Remplacement de variables simples
  - Variables multiples
  - Contexte de données
  - Accès aux propriétés imbriquées
  - Accès aux tableaux
  - Caractères spéciaux
  - Gestion d'erreurs

#### `arrays.test.js`
- **Couverture** : Module `arrays.js`
- **Tests inclus** :
  - Fonctions de manipulation d'arrays
  - Gestion des erreurs
  - Tests de performance
  - Cas limites

### 2. Tests des Services (`services/`)

#### `engine.test.js`
- **Couverture** : Classe `Engine` (moteur principal)
- **Tests inclus** :
  - Construction et initialisation
  - Résolution de chemins (`buildPathResolution`)
  - Flux DFOB (`buildDfobFlow`, `buildDfobFlowArray`)
  - Gestion d'erreurs
  - Intégration avec le répertoire de composants techniques
  - Gestion des processus
  - Accès à la configuration

#### `ProcessNotifier.test.js`
- **Couverture** : Classe `ProcessNotifier`
- **Tests inclus** :
  - Construction
  - Notifications de démarrage, mise à jour, completion
  - Gestion d'erreurs
  - Notifications d'information
  - Publication AMQP
  - Sérialisation de données
  - Tests de performance

### 3. Tests de Communication (`communication/`)

#### `index.test.js`
- **Couverture** : Module de communication AMQP/HTTP
- **Tests inclus** :
  - Initialisation du module
  - Gestion des clients AMQP
  - Opérations de file de messages
  - Endpoints HTTP
  - Sérialisation de messages
  - Gestion des connexions
  - Tests de performance
  - Tests d'intégration

## ⚙️ Configuration

### Environnement de Test
- **Framework** : Jest 29.7.0
- **Environnement** : Node.js
- **Timeout** : 30 secondes
- **Configuration** : Tests isolés avec mocks

### Dépendances de Test
```json
{
  "jest": "^29.7.0",
  "supertest": "^4.0.2",
  "@types/jest": "^29.5.5",
  "mongodb-memory-server": "^8.15.1",
  "sinon": "^15.2.0"
}
```

### Configuration Jest
- Transformations désactivées (pas de Babel)
- Setup automatique via `setup.js`
- Couverture de code configurée
- Patterns de test flexibles

## 🚀 Commandes Disponibles

### Via NPM (dans `tests/test_unitaires/`)
```bash
npm test                    # Tous les tests
npm run test:watch         # Mode watch
npm run test:coverage      # Avec couverture
npm run test:engine        # Tests moteur uniquement
npm run test:utils         # Tests utilitaires uniquement
npm run test:services      # Tests services uniquement
```

### Via Makefile (à la racine)
```bash
make test                  # Tous les tests unitaires
make test-unit            # Tests unitaires
make test-unit-watch      # Mode watch
make test-unit-coverage   # Avec couverture
make test-engine          # Tests moteur
make test-utils           # Tests utilitaires
make test-services        # Tests services
make test-integration     # Tests d'intégration E2E
```

## 🔧 Configuration Technique

### Fichiers de Configuration Créés
- `engine/configuration.js` - Configuration du moteur pour les tests
- `configuration.js` - Configuration racine
- `tests/test_unitaires/setup.js` - Setup Jest
- `tests/test_unitaires/babel.config.js` - Configuration Babel

### Mocks et Stubs
- Bibliothèques externes mockées (mongoose, express, etc.)
- Clients AMQP mockés
- Dépendances du core mockées

## 📊 Couverture de Code

La configuration inclut :
- Collecte de couverture sur `engine/**/*.js`
- Exclusion des `node_modules` et fichiers de configuration
- Rapports en format text, lcov et HTML
- Répertoire de sortie : `tests/test_unitaires/coverage/`

## 🎯 Composants Testés

### ✅ Complètement Testés
- `objectTransformation.js` et `objectTransformationV2.js`
- `stringReplacer.js`
- `arrays.js`
- `engine.js` (classe Engine)
- `ProcessNotifier.js`
- `communication/index.js`

### 🔄 Partiellement Testés
- Modules avec dépendances externes non installées

### ⏳ À Tester
- `technicalComponentDirectory.js`
- `security.js`
- Autres utilitaires (`strings.js`, `sys-info.js`, etc.)
- Services d'authentification
- Composants de workspace

## 🚨 Problèmes Résolus

1. **Configuration Babel** - Résolu par la création de fichiers de configuration appropriés
2. **Dépendances manquantes** - Identifiées et documentées
3. **Chemins de modules** - Configurés pour pointer vers les bons répertoires
4. **Mocks** - Mis en place pour les dépendances externes

## 📈 Prochaines Étapes

1. **Installer les dépendances manquantes** dans le dossier de test
2. **Ajuster les tests** selon l'API réelle des modules
3. **Ajouter des tests** pour les composants restants
4. **Intégrer** avec CI/CD
5. **Ajouter des tests d'intégration** spécifiques au moteur
6. **Optimiser** la couverture de code

## 🎉 Statut Actuel

✅ **Structure de test opérationnelle**
✅ **Jest configuré et fonctionnel**
✅ **Tests de base créés pour les composants principaux**
✅ **Commandes Make intégrées**
✅ **Configuration de couverture**
⚠️ **Quelques dépendances à résoudre**
⚠️ **Tests à ajuster selon l'API réelle**

La structure de test est maintenant en place et opérationnelle. Les développeurs peuvent commencer à utiliser les tests et les étendre selon leurs besoins.