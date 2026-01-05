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

## 📚 Additional Documentation

- [packages/core/TESTING.md](../packages/core/TESTING.md) - Testing guidelines
- [packages/core/MOCK_RATIONALE.md](../packages/core/MOCK_RATIONALE.md) - Mock strategies
- [README.md](../README.md) - Project overview and setup

