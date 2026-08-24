# Changelog

## [0.11.11] - 2026-08-24

### Security

- **Routes legacy `bigdataflow` désactivées** : fonctionnalité inutilisée (0 bigdataflow
  en prod, front archivé). La route `PUT /bigdataflow/:id` présentait le même confused
  deputy que les routes workspace (autoriser sur `req.params.id`, écrire sur
  `req.body._id`). Le service n'est plus monté dans `app.js` (surface d'attaque fermée) ;
  correctif de secours conservé dans le service.

## [0.11.10] - 2026-08-24

### Security

- **Confused deputy sur les routes sœurs** (signalé par Maxim Yakovlev) : les routes
  `PUT /workspaces/:id`, `PUT /workspaces/:id/components` et
  `DELETE /workspaces/:id/components` autorisaient sur `req.params.id` mais écrivaient
  sur `req.body._id` (jamais vérifié) → cross-tenant overwrite, **ownership takeover**,
  update/create/delete arbitraire de composants. La cible d'écriture est désormais liée
  à `req.params.id`, et les routes composants vérifient que le composant appartient au
  workspace autorisé.

## [0.11.9] - 2026-08-24

### Fixed

- **Admin — suppression d'un utilisateur** : la garde « propriétaire de workflow(s) »
  utilisait un filtre qui pouvait matcher deux membres différents du workspace → un
  simple **contributeur** était refusé à tort. Corrigé avec `$elemMatch` (même membre).

## [0.11.8] - 2026-08-24

### Added

- **Admin — suppression d'un utilisateur** : bouton « Supprimer » (avec confirmation).
  Refusé si le compte est propriétaire de workflow(s) ou si c'est le compte de l'admin
  connecté. La suppression retire le user des workspaces où il est contributeur.

## [0.11.7] - 2026-08-24

### Fixed

- **Admin — lignes du tableau des utilisateurs** : avec beaucoup d'utilisateurs, les
  lignes étaient compressées (hauteur quasi nulle → invisibles) à cause du
  `flex-shrink:1` imposé par `flex.css`. Les lignes gardent désormais leur hauteur
  (`flex-shrink:0`) et le tableau **scrolle** (conteneur `overflow-y:auto`).

## [0.11.6] - 2026-08-24

### Added

- **Admin — détail des workflows d'un user** : bouton « Détails » par utilisateur →
  accordéon listant ses workflows (nom, badge owner/contributeur, dernière exécution)
  avec un lien « Ouvrir ↗ » vers le workflow (nouvel onglet).

## [0.11.5] - 2026-08-24

### Added

- **Admin — nb de workflows séparé** : les colonnes « OWNER » et « CONTRIBUTEUR »
  (rôle non-owner) remplacent la colonne unique « WORKFLOWS » dans le tableau des
  utilisateurs. Les deux sont triables.

## [0.11.4] - 2026-08-24

### Added

- **Statistiques users dans l'écran admin** (`#admin` → Utilisateurs) : nombre de
  workflows, date d'inscription, dernière connexion, dernière exécution de workflow.
- **Tri par colonnes** dans le tableau des utilisateurs (nom, email, admin, workflows,
  inscription, dernière connexion, dernière exécution) — clic sur l'en-tête (▲/▼).
- **`lastLogin`** : nouveau champ user, renseigné à chaque connexion (classique + Google).

### Fixed

- **Bandeau d'onglets de l'admin** : hauteur fixe (48px) — plus de compression/illisibilité
  quand la liste des utilisateurs est longue ; la liste scrolle désormais.

## [0.11.3] - 2026-08-24

### Security

- **Broken Access Control (IDOR) sur `POST /workspaces/:id/import` corrigé** (divulgation
  coordonnée, chercheur Maxim Yakovlev). Voir
  `advisories/SB-IDOR-2026-01/2026-08-idor-workspace-import.md`.
- **`wrapperSecurity` (owner/editor) ajouté** sur l'import de composants dans un workspace
  (`POST /workspaces/:id/import`) — un utilisateur authentifié ne peut plus écrire de
  composants/liens dans un workspace auquel il n'est ni owner ni editor.
- **Défaut admin moindre privilège** : sans `adminUsers` configuré, plus aucun utilisateur
  n'est admin par défaut (avant : tout le monde). Bootstrap : le **premier utilisateur** d'une
  instance vide devient admin.
- **`GET /users` restreint aux admins** (`wrapperAdmin`) — la liste des utilisateurs n'est
  plus exposée à tout utilisateur authentifié.
- **Gestion admin par l'UI** : écran `#admin` avec onglets « Utilisateurs » / « Nettoyage »,
  boutons « Promouvoir admin » / « Retirer admin » (`PUT /users/:id/admin`), garde
  anti-lockout (un admin ne peut pas se dépromouvoir lui-même).

### Fixed

- **`GET /users/emails`** : nouvel endpoint (authentifié JWT, emails seulement) pour
  l'autocomplétion du partage de workflow — le partage d'un non-admin ne casse plus.
- `user_lib.getWithRelations` : garde contre `config` undefined.

## [0.11.2] - 2026-08-20

### Security

- **Correctif du bypass RCE `lodash.template`** (signalé par Maxim Yakovlev) : `lodash.template`
  compilait son corps avec un `Function` du host realm, échappant au contexte vm → `import()`
  chargeait des modules Node → RCE dans le eval-service.
- **Whitelist par lib dans le validateur** (analyse statique, pas de Proxy) : les fonctions
  statiques des libs exposées (lodash, he, dayjs, moment, Buffer, crypto) sont explicitement
  autorisées ; toute autre méthode est bloquée.
- **Réduction du scope d'exposition** : `Buffer`, `crypto`, `he` exposés en wrappers minimaux ;
  `lodash` en whitelist stricte ; `dayjs`/`moment` méthodes statiques whitelistées.
- **`import()` dynamique rejeté** dans le worker (`importModuleDynamically`).
- **`fetch`/`WebSocket` strippés** (défense en profondeur).
- **Retour au comportement Loki** : évaluation atomique par item, la boucle du `$where` est
  gérée par l'engine (le container ne fait qu'une évaluation à la fois).

### Fixed

- `runWhereInWorker`/`runWhereInRemote` retirés (obsolètes — remplacés par l'éval atomique).
- `crypto.randomBytes` exposé (cas prod).

## [0.11.1] - 2026-08-19

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

[0.11.2]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.11.1...v0.11.2
[0.11.1]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/assemblee-virtuelle/Semantic-Bus/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/assemblee-virtuelle/Semantic-Bus/releases/tag/v0.9.0
