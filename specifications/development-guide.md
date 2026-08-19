# Semantic-Bus Development Guide

> Code standards, conventions, and common development tasks

---

## 🌐 Language Rules

| Context | Language |
|---------|----------|
| Code (variables, functions) | English |
| Comments in code | English |
| Documentation (markdown) | English |
| Chat / Discussion | French |

---

## 📋 Code Standards

### Style Rules

- **Indentation**: 2 spaces
- **Quotes**: Single quotes (`'`)
- **Semicolons**: Required
- **Variable names**: Descriptive, camelCase

```javascript
// ✅ Good
const workspaceComponent = await getComponent(id);
const userAuthentication = require('./auth');

// ❌ Bad
const wsc = await getComponent(id);
const auth = require('./auth');
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| JavaScript modules | camelCase | `workspaceWebService.js` |
| Classes | PascalCase | `ProcessNotifier.js` |
| Config files | kebab-case | `docker-compose.yaml` |

### Import Patterns

```javascript
// From core package
const { workspace, user } = require('@semantic-bus/core');
const errorHandling = require('@semantic-bus/core/helpers/errorHandling');
const { mongoClient } = require('@semantic-bus/core/db/mongo_client');

// Local requires
const security = require('./services/security');
```

### Error Handling

Always use centralized error handling:

```javascript
const errorHandling = require('@semantic-bus/core/helpers/errorHandling');
```

---

## 🔍 Finding Code

### Component Files

For any component `xyz`:

| Package | Path |
|---------|------|
| Main (UI) | `main/server/workspaceComponentInitialize/xyz.js` |
| Engine (Executor) | `engine/workspaceComponentExecutor/xyz.js` |
| Registry (Main) | `main/server/services/technicalComponentDirectory.js` |
| Registry (Engine) | `engine/services/technicalComponentDirectory.js` |

### Other Code Locations

| Purpose | Path |
|---------|------|
| REST API endpoints | `main/server/*WebService.js` |
| Business logic | `core/lib/*_lib.js` |
| Data models | `core/models/*_model.js` |
| Schema definitions | `core/model_schemas/*_schema.js` |
| Database clients | `core/db/*.js` |
| Utilities | `core/helpers/*.js` |

### Key Files

| Purpose | Path |
|---------|------|
| Main entry | `packages/main/app.js` |
| Engine entry | `packages/engine/app.js` |
| Database client | `packages/core/db/mongo_client.js` |
| Error handling | `packages/core/helpers/errorHandling.js` |

---

## 🏗️ Common Tasks

### Adding a New Component

1. **Create initializer** in `main/server/workspaceComponentInitialize/newComponent.js`
2. **Create executor** in `engine/workspaceComponentExecutor/newComponent.js`
3. **Register** in both `technicalComponentDirectory.js` files

See [architecture.md](./architecture.md#creating-a-new-component) for code examples.

### Modifying an API Endpoint

1. Find the WebService file in `main/server/`
2. Check security requirements (safe vs unsafe routes)
3. Update corresponding lib in `core/lib/` if business logic changes

### Adding a New Library

1. Create in `core/lib/newFeature_lib.js`
2. Export from `core/lib/index.js`
3. Add corresponding model if needed

---

## 🧪 Testing

### Test Structure

```
packages/*/
├── __tests__/           # Test files
├── __mocks__/           # Mock implementations
├── jest.config.js       # Jest configuration
└── jest.setup.js        # Test setup
```

### Running Tests

```bash
# All packages
npm run test:all

# Specific packages
npm run test:core
npm run test:main
npm run test:engine

# Linting
npm run lint:all
```

### Writing Tests

- Place tests in `__tests__/` directory
- Use mocks from `__mocks__/` directory
- Follow naming: `*.test.js`

### Before Committing

```bash
npm run test:all    # Run all tests
npm run lint:all    # Check code style
```

---

## ⚠️ Rules

### Never Do

- ❌ Modify `config.json` directly (use `config.local.json`)
- ❌ Add component to only one package (both main AND engine required)
- ❌ Skip the `technicalComponentDirectory` registration
- ❌ Use French in code variables or comments
- ❌ Commit without running tests

### Always Do

- ✅ Follow existing code style in the file
- ✅ Update both main and engine for components
- ✅ Test your changes locally
- ✅ Use English for all code
- ✅ Check [architecture.md](./architecture.md) for patterns

---

## ⚙️ Operations & Runbook

> Commandes et points de vigilance opérationnels, en particulier liés au `eval-service`
> (service d'évaluation isolé) et à RabbitMQ.

### Services Docker

Le workspace comprend 4 packages : `core`, `main`, `engine`, `timer`, et un service
`eval-service` (évaluation JS isolée en container). Voir `docker-compose.yaml` (racine) et
`packages/eval-service/`.

### Tests

```bash
# Tests unitaires (sans container)
cd packages/core && npx jest                 # core
cd packages/engine && npx jest --forceExit   # engine (workers : --forceExit utile en local)
cd packages/timer && npx jest                # timer

# Tests d'intégration du eval-service (nécessite le container)
cd /home/simon/GIT/Bus/Semantic-Bus
make test-eval                              # build + démarre le container + lance les tests d'intégration

# Si `npm ci` isolé dans un sous-package a cassé le node_modules partagé :
npm install --legacy-peer-deps               # restaure tout le workspace
```

### CI (`.github/workflows/`)

- **`tests.yml`** : 5 jobs — `test-core`, `test-main`, `test-engine`, `test-timer`,
  `test-eval-service`. Chaque job fait `cd packages/X && npm ci` puis `npm test`.
  Le job `test-eval-service` fait en plus `docker compose up -d --build eval-service` +
  attente health + `npx jest packages/eval-service/__tests__/eval-service.integration.test.js`.
- **`lint.yml`** : lint de core/main/engine (et auto-format). **N'inclut PAS eval-service.**
- **`security.yml`** : `npm audit --audit-level=critical` sur core/main/engine/timer
  (N'inclut PAS eval-service).

### Points de vigilance (reprise / CI)

1. **Le `package-lock.json` racine doit être COMMITÉ avec le workspace `eval-service`.**
   Sans ce lockfile, `npm ci` dans `packages/eval-service` échouera ("lock file not up to
   date" / workspace introuvable). Les autres packages n'ont pas de lockfile propre → ils
   utilisent le lockfile racine.
2. **`npm ci` isolé dans un sous-package CASSE le node_modules partagé en local.**
   Ex. : `cd packages/eval-service && npm ci` supprime `lokijs` du node_modules racine → les
   tests engine échouent (`Cannot find module 'lokijs'`). Résolu par `npm install
   --legacy-peer-deps` racine. **En CI, chaque job a son propre runner → pas de partage → pas
   de problème.**
3. **Secret HMAC du eval-service — plus d'env, config.json montée.** Le eval-service monte
   `config.json` (`/data/packages/engine/config.json`) et son image expose un symlink
   `@semantic-bus/engine` → `getConfiguration` résout la config → `hmac_lib.secret()` =
   `config.secret`. **Plus de variable `ENGINE_HMAC_SECRET` / `.env` requise en prod.**
   En CI / test, `getConfiguration()` peut échouer → secret fallback
   `test-secret-for-testing` ; `make test-eval` et les tests définissent donc
   `ENGINE_HMAC_SECRET=secret` **côté test uniquement**.
4. **`npm test` en CI vs local.** Les tests passent en local avec `npx jest --forceExit`
   (les workers "failed to exit gracefully" peuvent timeout le shell local) ; en CI headless
   ça se termine normalement (warning non bloquant).
5. **`security.yml`** : si `npm audit` détecte des vulnérabilités critiques dans
   core/main/engine/timer, le job (qui bloque sur `critical`) échouera.
6. **`lint.yml`** : les erreurs de style pré-existantes (`no-async-promise-executor`,
   `semi`, indentation de `arraySplitByCondition`) peuvent faire échouer `npm run lint`.

### RabbitMQ

- **`make rabbit-up`** : (re)crée le conteneur rabbitmq.
- **`make rabbit-reset`** : **reconstruit proprement** RabbitMQ (stop + rm + suppression du
  volume `rabbitmq_data` + up) → recharge les définitions (users/vhosts/queues) au démarrage.
- Les définitions ne s'appliquent **qu'au premier démarrage** (base vide) ; pour recharger sur
  un volume existant, utiliser **`make rabbit-reset`**.
- **User `guest` supprimé** ; services + navigateur utilisent `stomp-user` (défini dans les
  définitions RabbitMQ + `amqpStompLogin`/`amqpStompPassword` en config).
- **Changer le mot de passe STOMP** : éditer `"password"` dans les définitions RabbitMQ (dev)
  + aligner `amqpStompPassword` (config) puis `make rabbit-reset`.

### Configuration

- **Tout est dans `config.json`** (MongoDB, SMTP, Google OAuth, Stripe, `amqpStomp*`,
  `secret`) — **pas de `.env`**. Voir `specifications/configuration.md`.
- Les `packages/engine/config.json` et `packages/timer/config.json` sont **vides** dans le
  repo, mais en docker chaque service monte `config.local.json` (racine) comme sa config.
  Les fichiers vides ne posent problème qu'en exécution **hors docker** (standalone) où
  `require('./config.json')` retournerait `{}`.

---

## 📚 Additional Documentation

- [packages/core/TESTING.md](../packages/core/TESTING.md) - Testing guidelines
- [packages/core/MOCK_RATIONALE.md](../packages/core/MOCK_RATIONALE.md) - Mock strategies
- [README.md](../README.md) - Project overview and setup

