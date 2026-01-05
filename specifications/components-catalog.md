# Semantic-Bus Components Catalog

> Complete catalog of all available workflow components

---

## 📂 Component Categories

Components are organized using a SKOS taxonomy with 4 main categories:

| Category | Description |
|----------|-------------|
| **Intégration** | Connect to external systems (read/write) |
| **Déclencheurs** | Start workflow execution |
| **Manipulation** | Transform and process data |
| **Utilitaires** | Helper functions and utilities |

> Note: Some components belong to multiple categories (e.g., `httpProvider` is both Integration and Trigger)

---

## 🔌 Intégration Components

### API & Web (`integrationApi`)

| Component | Type | Description | Multi-category |
|-----------|------|-------------|----------------|
| `httpConsumer` | HTTP consumer | Call an external HTTP API | - |
| `httpProvider` | HTTP provider | Expose your workflow as an HTTP API endpoint | + Déclencheurs |
| `scrapper` | Web scrapper | Extract data from web pages | - |

### Fichiers (`integrationFiles`)

| Component | Type | Description | Multi-category |
|-----------|------|-------------|----------------|
| `sftpConsumer` | SFTP consumer | Download files from SFTP server | - |
| `sftpUploader` | SFTP uploader | Upload files to SFTP server | - |
| `upload` | Upload | Import a file into the workflow | + Déclencheurs |

### Base de données (`integrationDatabase`)

| Component | Type | Description |
|-----------|------|-------------|
| `mongoConnector` | Mongo | Query a MongoDB database |
| `sqlConnector` | SQL | Query a SQL database |
| `influxdbConnector` | InfluxDB | Query an InfluxDB time-series database |

### Messagerie (`integrationMessaging`)

| Component | Type | Description |
|-----------|------|-------------|
| `imap` | IMAP | Read emails from IMAP server |

### Services (`integrationServices`)

| Component | Type | Description | Multi-category |
|-----------|------|-------------|----------------|
| `googleGetJson` | Google Sheets | Fetch data from Google Sheets | - |
| `googleAuth` | Google Auth | Authenticate with Google OAuth | + Utilitaires |
| `framcalcGetCsv` | Framacalc CSV | Fetch CSV data from Framacalc | - |

### Géocodage (`integrationGeocoding`)

| Component | Type | Description | Multi-category |
|-----------|------|-------------|----------------|
| `googleGeoLocaliser` | Google Geocoding | Geocode addresses using Google API | + Manipulation (Enrichissement) |
| `gouvFrGeoLocaliser` | data.gouv Geocoding | Geocode French addresses using gouv.fr API | + Manipulation (Enrichissement) |
| `gouvFrInverseGeo` | data.gouv Reverse | Reverse geocode coordinates to address | + Manipulation (Enrichissement) |

---

## 🚀 Déclencheurs Components

Components that trigger workflow execution:

| Component | Type | Description | Multi-category |
|-----------|------|-------------|----------------|
| `timer` | Timer | Trigger workflow at regular intervals | - |
| `httpProvider` | HTTP provider | Trigger workflow via HTTP request | + Intégration |
| `upload` | Upload | Trigger workflow on file upload | + Intégration |

---

## 🔧 Manipulation Components

### Mapping (`manipulationMapping`)

| Component | Type | Description |
|-----------|------|-------------|
| `objectTransformer` | Transform | Map and transform objects using transformation rules |
| `valueMapping` | Value Mapping | Map values using correspondence tables |
| `valueFromPath` | Root from Path | Extract value from JSON path |
| `queryParamsCreation` | Params Transform | Create query parameters in the flow |

### Évaluation (`manipulationEvaluation`)

| Component | Type | Description |
|-----------|------|-------------|
| `jsEvaluation` | JS Evaluation | Execute custom JavaScript code |
| `regex` | Regex | Apply regular expressions |
| `slugify` | Slugify | Convert text to URL-safe slugs |

### Conversion (`manipulationConversion`)

| Component | Type | Description |
|-----------|------|-------------|
| `jsonLdConversion` | JSON-LD | Convert data to/from JSON-LD format |
| `binaryExtractor` | Binary Extractor | Extract data from binary files |

### Restructuration (`manipulationRestructure`)

| Component | Type | Description |
|-----------|------|-------------|
| `keyToArray` | Key to Array | Convert object keys to array |
| `flat` | Flat | Flatten nested structures |
| `propertiesMatrix` | Properties Matrix | Create matrix of property combinations |

### Collections (`manipulationCollections`)

| Component | Type | Description |
|-----------|------|-------------|
| `filter` | Filter | Filter data based on conditions |
| `sort` | Sort | Sort data by specified fields |
| `slice` | Slice | Extract a portion of array data |
| `arraySplitByCondition` | Array Split | Split arrays based on conditions |

### Agrégation (`manipulationAggregation`)

| Component | Type | Description |
|-----------|------|-------------|
| `simpleAgregator` | Aggregate | Aggregate data from multiple sources |
| `joinByField` | Join | Join datasets by common field |
| `unicity` | Unicity | Remove duplicates based on criteria |

### Enrichissement (`manipulationEnrichment`)

| Component | Type | Description | Multi-category |
|-----------|------|-------------|----------------|
| `googleGeoLocaliser` | Google Geocoding | Enrich with coordinates from addresses | + Intégration |
| `gouvFrGeoLocaliser` | data.gouv Geocoding | Enrich with coordinates from French addresses | + Intégration |
| `gouvFrInverseGeo` | data.gouv Reverse | Enrich with addresses from coordinates | + Intégration |

---

## 🛠️ Utilitaires Components

| Component | Type | Description | Multi-category |
|-----------|------|-------------|----------------|
| `cacheNosql` | Cache NoSQL | Store/retrieve data from cache | - |
| `incrementTable` | Increment Table | Build incremental number tables | - |
| `googleAuth` | Google Auth | Authenticate with Google OAuth | + Intégration |

---

## ❌ Deprecated Components

These components are referenced but no longer displayed in the UI:

| Component | Reason | Replacement |
|-----------|--------|-------------|
| `httpConsumerFile` | Merged functionality | `httpConsumer` |
| `restGetJson` | Alias | `httpConsumer` |
| `postConsumer` | Alias | `httpConsumer` |
| `restApiPost` | Replaced | `httpProvider` |
| `restApiGet` | Replaced | `httpProvider` |
| `httpGet` | Merged | `httpConsumer` |
| `sparqlRequest` | Never used, in maintenance | - |
| `deeperFocusOpeningBracket` | No tags defined | - |

---

## 🏗️ Component Structure

### Initializer (Main package)

Location: `packages/main/server/workspaceComponentInitialize/`

```javascript
'use strict';
class MyComponent {
  constructor() {
    this.type = 'My Component';
    this.description = 'Description for users';
    this.editor = 'my-component-editor';
    this.graphIcon = 'MyComponent.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationMapping'
    ];
    this.stepNode = true; // default, false for triggers
  }
}
module.exports = new MyComponent();
```

### Executor (Engine package)

Location: `packages/engine/workspaceComponentExecutor/`

```javascript
'use strict';
class MyComponent {
  constructor() {
    // Optional initialization
  }

  pull(data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        const inputData = flowData[0].data;
        const specificData = data.specificData;
        
        // Process data
        const result = processData(inputData, specificData);
        
        resolve({ data: result });
      } catch (e) {
        reject(e);
      }
    });
  }
}
module.exports = new MyComponent();
```

---

## 🏷️ Tag System

Tags follow SKOS hierarchy with base URI: `http://semantic-bus.org/data/tags/`

```
├── integration
│   ├── integrationApi
│   ├── integrationFiles
│   ├── integrationDatabase
│   ├── integrationMessaging
│   ├── integrationServices
│   └── integrationGeocoding
│
├── triggers
│
├── manipulation
│   ├── manipulationMapping
│   ├── manipulationEvaluation
│   ├── manipulationConversion
│   ├── manipulationRestructure
│   ├── manipulationCollections
│   ├── manipulationAggregation
│   └── manipulationEnrichment
│
└── utilities
```

### Multi-category Components

Some components belong to multiple categories:

| Component | Categories |
|-----------|------------|
| `httpProvider` | integration, integrationApi, triggers |
| `upload` | integration, integrationFiles, triggers |
| `googleAuth` | integration, integrationServices, utilities |
| `googleGeoLocaliser` | integration, integrationGeocoding, manipulation, manipulationEnrichment |
| `gouvFrGeoLocaliser` | integration, integrationGeocoding, manipulation, manipulationEnrichment |
| `gouvFrInverseGeo` | integration, integrationGeocoding, manipulation, manipulationEnrichment |

---

## 💰 Component Pricing

Each component has an execution cost (in credits):

| Range | Components |
|-------|------------|
| 10 | timer, httpProvider, cacheNosql |
| 20 | googleGetJson, framcalcGetCsv, gouvFrGeoLocaliser, gouvFrInverseGeo, googleGeoLocaliser, mongoConnector, sqlConnector, influxdbConnector, simpleAgregator, valueFromPath, queryParamsCreation, httpConsumer, flat, regex, slugify, slice, incrementTable, jsonLdConversion, imap, googleAuth, binaryExtractor, sftpUploader |
| 40 | filter, sort, keyToArray, jsEvaluation, valueMapping, upload, sftpConsumer |
| 60 | joinByField, scrapper, unicity, arraySplitByCondition |
| 80 | objectTransformer |

See `config.json` → `components_information` for full pricing.

---

## 📊 Component Summary

| Category | Count |
|----------|-------|
| **Intégration** | 13 components (+ 6 multi-category) |
| **Déclencheurs** | 3 components (2 shared with Intégration) |
| **Manipulation** | 19 components (+ 3 shared with Intégration) |
| **Utilitaires** | 3 components (1 shared with Intégration) |
| **Total unique** | 37 active components |
| **Deprecated** | 8 components |
