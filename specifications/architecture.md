# Semantic-Bus Architecture

> ETL-style data middleware transformation embedded in an ESB for all kind of data

---

## 📁 Project Structure Overview

```
Semantic-Bus/
├── packages/
│   ├── core/          # Shared low-level services and libraries
│   ├── main/          # Main app: Frontend and API
│   ├── engine/        # Graph resolution engine
│   └── timer/         # Scheduled workflow service
├── specifications/    # Architecture and development guidelines
├── docker-compose.yaml
├── Makefile
└── config.json        # Default configuration (versioned)
```

---

## 🏗️ Architecture Overview

### Monorepo Structure

The project uses **npm workspaces** to manage four main packages:

| Package | Port | Description |
|---------|------|-------------|
| `core` | - | Shared libraries, models, helpers, and database connectors |
| `main` | 80 | Frontend (static client) + REST API + Component initializers |
| `engine` | 8080 | Workflow execution engine with component executors |
| `timer` | - | Cron-based scheduled workflow triggering |

### Communication

- **AMQP/RabbitMQ**: Inter-service messaging between `main` and `engine`
- **MongoDB**: Primary database for workspaces, components, users
- **ScyllaDB/DynamoDB**: High-performance storage for fragments and files

---

## 📦 Package Details

### Core (`packages/core/`)

The shared foundation layer providing:

```
core/
├── db/                    # Database clients (mongo, scylla, dynamodb)
├── lib/                   # Business logic libraries
│   ├── user_lib.js        # User management
│   ├── workspace_lib.js   # Workspace CRUD
│   ├── workspace_component_lib.js
│   ├── fragment_lib.js    # Data fragment handling
│   ├── file_lib.js        # File storage
│   ├── cache_lib.js       # Caching layer
│   └── auth_lib.js        # Authentication
├── models/                # Mongoose/DB models
├── model_schemas/         # Schema definitions
├── helpers/               # Utility functions
│   ├── promiseOrchestrator.js  # Promise batch execution
│   ├── graph-traitment.js      # Graph traversal utilities
│   ├── errorHandling.js        # Centralized error handling
│   └── dfobProcessor.js        # Data flow object processing
├── dataTraitmentLibrary/  # Data format converters (CSV, XML, Excel, RDF)
└── Oauth/                 # OAuth strategies (Google)
```

**Usage**: Import via `@semantic-bus/core`

```javascript
const { workspace, user } = require('@semantic-bus/core');
const errorHandling = require('@semantic-bus/core/helpers/errorHandling');
```

---

### Main (`packages/main/`)

The frontend and API gateway:

```
main/
├── app.js                 # Express server entry point
├── client/static/         # Frontend assets (HTML, JS, CSS, images)
├── server/
│   ├── services/
│   │   ├── technicalComponentDirectory.js  # Component registry
│   │   ├── security.js                     # API security middleware
│   │   └── mail.js                         # Email service
│   ├── workspaceComponentInitialize/       # UI configuration for each component
│   │   ├── objectTransformer.js
│   │   ├── httpProvider.js
│   │   ├── filter.js
│   │   └── ... (one file per component type)
│   ├── *WebService.js     # REST API endpoints
│   └── utils/             # Server utilities
└── configuration.js       # Runtime config loader
```

**Component Initialization Pattern**:
Each component type has an initializer that defines:
- `type`: Component identifier
- `description`: User-facing description
- `editor`: UI editor template name
- `graphIcon`: Visual icon for workflow graph
- `tags`: Categorization tags

---

### Engine (`packages/engine/`)

The workflow execution engine:

```
engine/
├── app.js                 # Express server with AMQP listener
├── communication/         # AMQP message handling
├── services/
│   ├── engine.js          # Core graph execution logic
│   ├── technicalComponentDirectory.js  # Executor registry
│   ├── ProcessNotifier.js # Execution status broadcasting
│   └── security.js        # Security validation
├── workspaceComponentExecutor/  # Execution logic for each component
│   ├── objectTransformer.js
│   ├── httpProvider.js
│   ├── httpConsumer.js
│   ├── filter.js
│   ├── scrapper/
│   └── ... (one file per component type)
└── utils/                 # Execution utilities
    ├── objectTransformation.js
    ├── stringReplacer.js
    └── graph-traitment.js
```

**Executor Pattern**:
Each executor must export:
- `main(component, workspace, context)`: Async execution function
- Returns processed data or triggers next components

---

### Timer (`packages/timer/`)

Scheduled workflow execution service:

```
timer/
├── app.js                 # CRON-based scheduler
└── configuration.js       # Timer-specific config
```

---

## 🔄 Component System

### Dual Registration Pattern

Every component must be registered in **two places**:

1. **Main** (`packages/main/server/workspaceComponentInitialize/`):
   - Defines UI metadata and editor configuration
   - Registered in `technicalComponentDirectory.js`

2. **Engine** (`packages/engine/workspaceComponentExecutor/`):
   - Implements actual execution logic
   - Registered in `technicalComponentDirectory.js`

### Creating a New Component

1. Create initializer in `main/server/workspaceComponentInitialize/myComponent.js`:

```javascript
module.exports = {
  type: 'myComponent',
  description: 'My component description',
  editor: 'simpleInputEditor',
  graphIcon: 'fa-cog',
  tags: ['transform', 'data']
};
```

2. Create executor in `engine/workspaceComponentExecutor/myComponent.js`:

```javascript
module.exports = {
  main: async function(component, workspace, context) {
    const inputData = context.inputData;
    // Process data
    const result = transform(inputData);
    return result;
  }
};
```

3. Register in both `technicalComponentDirectory.js` files:

```javascript
myComponent: require('../workspaceComponentInitialize/myComponent.js'),
// or
myComponent: require('../workspaceComponentExecutor/myComponent.js'),
```

---

## 🗄️ Database Architecture

### MongoDB Collections

| Collection | Purpose |
|------------|---------|
| `users` | User accounts and profiles |
| `workspaces` | Workflow definitions |
| `workspace_components` | Component configurations |
| `caches` | Execution cache |
| `errors` | Error logging |
| `historiqueends` | Execution history |

### ScyllaDB/DynamoDB Tables

| Table | Purpose |
|-------|---------|
| `fragments` | Large data fragments for streaming |
| `files` | Binary file storage |

---

## 🔐 Security Architecture

### API Security Layers

1. **Public routes** (`/data/auth`, `/data/specific/anonymous`): No authentication
2. **Protected routes** (`/data/core`, `/data/specific`): JWT token required

### Authentication Flow

1. OAuth2 (Google) or email/password
2. JWT token generation
3. Token validation via `securityService.securityAPI()`

---

## 📡 Message Queue Architecture

### AMQP Queues

| Queue | Direction | Purpose |
|-------|-----------|---------|
| `work-ask` | Main → Engine | Workflow execution request |
| `process-start` | Engine → Main | Execution started notification |
| `process-end` | Engine → Main | Execution completed notification |
| `process-error` | Engine → Main | Execution error notification |
| `process-persist` | Engine → Main | Intermediate result persistence |

### Message Flow

```
[Main API] → work-ask → [Engine]
                           ↓
                    Execute workflow
                           ↓
[Main] ← process-end ← [Engine]
```

---

## 🛠️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | 80/8080 | Application port |
| `CONFIG_URL` | - | External config URL |
| `NODE_ENV` | development | Environment mode |

### Config Files

- `config.json`: Default versioned configuration
- `config.local.json`: Local overrides (gitignored)

```bash
cp config.json config.local.json
```

---

## 🐳 Docker Deployment

### Services

| Service | Image | Exposed Port |
|---------|-------|--------------|
| main | semantic-bus-main | 80 |
| engine | semantic-bus-engine | 8080 |
| mongo | mongo:latest | 27017 |
| rabbitmq | rabbitmq:management | 5672, 15672 |
| scylla | scylladb/scylla | 9042 |

### Commands

```bash
make start    # Start all services
make stop     # Stop all services
make restart  # Recreate containers
make log      # View logs
```

---

## 🔗 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.x | Web framework |
| mongoose | ^8.x | MongoDB ODM |
| amqp-connection-manager | ^4.x | RabbitMQ client |
| node-cron | ^3.x | Scheduled tasks |
| passport | ^0.7.x | Authentication |
