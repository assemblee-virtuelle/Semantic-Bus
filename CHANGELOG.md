# Changelog

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
