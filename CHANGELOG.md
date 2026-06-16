# Changelog

## [0.10.0] - 2026-06-16

### Fixed

- **framacalc editor**: corrigé le décalage de nom entre le tag Riot.js côté client (`framacalc-get-csv-editor`) et la référence serveur (`framcalc-get-csv-editor`). Le tag a été renommé pour correspondre à la valeur stockée en base, évitant l'erreur `Cannot read properties of undefined (reading 'class')` à l'ouverture du composant Framacalc.

## [0.9.1] - 2026-06-XX

### Added

- **httpConsumer**: nouvelle option `includeRequest` pour inclure la requête entière dans la sortie du composant

## [0.9.0] - 2026-06-XX

### Added

- **Sort component**: nouveau composant de tri
- **Component search**: barre de recherche dans le catalogue de composants
- **New category system**: réorganisation des catégories de composants

[0.10.0]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/assemblee-virtuelle/Semantic-Bus/releases/tag/v0.9.0
