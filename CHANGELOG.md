# Changelog

## [Unreleased] - security fix (RCE eval) — branche `security/remove-sift-and-secure-eval`

### Security

- **RCE via `eval` corrigée** (divulgation coordonnée, chercheur Maxim Yakovlev). Voir
  `advisories/SB-RCE-2026-01/2026-08-semantic-bus-rce-eval.md` et le dossier de cas
  (interne, `advisories/SB-RCE-2026-01/SB-RCE-2026-01-case-file.md`).
- **Retrait de `sift`** (RCE via `new Function`) → filtres natifs.
- **Validation statique AST** (`validateExpression`) avant toute évaluation JS.
- **`eval` isolé dans le container `eval-service`** (plus d'`eval` dans le process principal
  de l'engine) : validation + sanitisation + worker_threads persistants (contexte vm neuf par
  job) + timeout.
- **`MongoDB.js`** : plus d'`eval`, grammaire stricte (`mongoQueryExecutor`).
- **Auth des points d'exécution** : signature HMAC sur `POST /engine/work-ask/:componentId`,
  JWT + autorisation sur la file AMQP `work-ask`, rate-limit IP sur `/data/api/*`.
- **Validation `specificData` à l'écriture** des composants.
- **RabbitMQ** : user `guest` supprimé, `stomp-user` dédié + credentials JWT pour le navigateur.

### Performance

- **Agent HTTP keep-alive** vers le eval-service (réutilisation des sockets).
- **Pool de workers persistants** dans le eval-service (contexte vm neuf par job).
- **Signature HMAC sur octets bruts** (`signBuffer`/`verifyBuffer`) : 1 sérialisation + 1 parse.
- Résultat : ~900 ms → ~7 ms par évaluation (bout en bout, prod).

### Fixed

- HMAC : normalisation du corps avant signature (ObjectId mongo).
- `$where` : `runWhereInRemote` lit le champ `matches` (réponse `/where`).
- Mongo : matérialisation des cursors async-itérables (driver).
- Mongo : constructeurs whitelistés (`ObjectId`, `ISODate`, `Date`, `NumberLong`,
  `NumberDecimal`).

## [0.11.0] - 2026-06-17

### Fixed

- **framacalc editor**: correction du décalage de nom entre le tag Riot.js et la référence serveur. Le serveur utilisait `framcalc-get-csv-editor` (typo) alors que la base de données stocke `framacalc-get-csv-editor` (orthographe correcte). Le serveur et le tag client ont été alignés sur la valeur en base. Les 2 composants en base avec le mauvais nom ont été corrigés dans MongoDB Atlas.
- **no-editor fallback**: ajout d'un fallback dans `workspaceComponentEditor` : si le tag d'édition n'est pas trouvé, le composant `no-editor` est monté au lieu de planter avec `Cannot read properties of undefined (reading 'class')`.
- **archived editors**: suppression des références `editor` dans les initializers des composants archivés (`gouvFrGeoLocaliserMass`, `xmlToObject`) pour éviter les crashs sur les anciens noeuds.

## [0.10.0] - 2026-06-16

### Fixed

- **framacalc editor**: corrigé le décalage de nom entre le tag Riot.js côté client et la référence serveur, évitant l'erreur `Cannot read properties of undefined (reading 'class')` à l'ouverture du composant Framacalc.

## [0.9.1] - 2026-06-XX

### Added

- **httpConsumer**: nouvelle option `includeRequest` pour inclure la requête entière dans la sortie du composant

## [0.9.0] - 2026-06-XX

### Added

- **Sort component**: nouveau composant de tri
- **Component search**: barre de recherche dans le catalogue de composants
- **New category system**: réorganisation des catégories de composants

[0.11.0]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/assemblee-virtuelle/Semantic-Bus/releases/tag/v0.9.0
