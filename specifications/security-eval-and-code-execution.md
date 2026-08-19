# Spec — Sécurisation des évaluations de code dynamique (`eval` / `new Function`)

> Statut : **Phase 1 (retrait sift) + Phase 2 (sécurisation eval) + Phase 3 (worker/timeout, auth, validation à l'écriture) implémentées.**
> Contexte : audit de sécurité suite au signalement d'une RCE par le composant Filter (chercheur Maxim Yakovlev, divulgation coordonnée).
> Mise à jour : branche `security/remove-sift-and-secure-eval`.
> Approche finale : retour au `eval` master + validateur AST (`validateExpression`) + sanitisation
> des données injectées (`evalSecurity`) + **exécution dans le container `eval-service`**
> (worker_threads persistants, contexte vm neuf par job, timeout). Voir §8.5.
> **Le sandbox isolated-vm a été abandonné** (voir §5.1-B).

---

## 1. Objectif de cette spec

Ce document regroupe **tous les problèmes liés à l'évaluation de code dynamique** dans
Semantic-Bus (server-side, `packages/engine`, `packages/main/server`, `packages/core`) et
propose des solutions. Il sert de référence pour décider et implémenter les correctifs.

Les correctifs **ne sont pas implémentés** dans cette branche : on s'est contenté, pour
l'instant, de supprimer les usages de la bibliothèque `sift` (remplacée par des filtres
natifs) et de neutraliser le code mort `pull`/`sift` du composant Filter. Le travail ici
porte sur les `eval` restants (y compris les chemins Loki) et les choix de remédiation.

---

## 2. Contexte : le modèle de menace

### 2.1 Déploiement cible

Multi-tenant SaaS public :

- N'importe quel utilisateur peut s'inscrire et obtenir un JWT valide.
- Un utilisateur authentifié peut créer un workspace (`POST /workspaces/`) et des composants
  (`POST /workspaces/:id/components`) avec un `specificData` **libre** (schéma Mongoose
  `workspace_component_schema.js:23` : `specificData: {type: Object}` — aucune validation).
- Le rôle `editor` (partage) permet aussi de modifier composants et workflows.
- Les composants sont exécutés par le process Node de l'engine, qui tourne sur le réseau
  Docker avec accès à MongoDB, Scylla, RabbitMQ, le volume `./uploads` et les secrets du
  `config.json` (`secret`, Stripe, Google…).

### 2.2 Surface d'attaque reconnue

Un acteur qui peut créer/modifier un composant peut faire exécuter du JS arbitraire au
process engine. Plusieurs composants offrent d'ailleurs volontairement une évaluation de JS
(`jsEvaluation`, `objectTransformer`, `sort`, `queryParamsCreation`, `filter`, `arraySplitByCondition`…).
C'est une capacité "par conception" pour les workflows, mais elle devient une **RCE** dès
lors que la frontière de confiance est un simple JWT valide (n'importe quel utilisateur
inscrit, ou un éditeur partagé).

La gravité est aggravée par deux endpoints **sans authentification** qui permettent de
fournir `pushData` / `queryParams` à l'engine :

- `POST /engine/work-ask/:componentId` (`engine/communication/index.js:8`, monté sur le
  routeur `unsafe` dans `engine/app.js:49-50`) ;
- `/data/api/*` via le composant httpProvider (`workspaceComponentInitialize/httpProvider.js:108+`,
  monté sur `unSafeRouteur`).

Ces entrées anonymes peuvent être interpolées dans les chaînes évaluées (voir §4.3).

---

## 3. Inventaire des sinks `eval` / `new Function` (audit du code source)

### 3.1 Résultat global

| # | Fichier | Ligne | Code | Risque | État |
|---|---------|-------|------|--------|------|
| 1 | `engine/utils/objectTransformationV2.js` | 136 | `eval(patternEval)` | 🔴 Critique (RCE) | ✅ **Traité** : `validateExpression` avant exécution |
| ~~2~~ | ~~`engine/utils/objectTransformation.js` (V1)~~ | ~~469/471~~ | ~~`eval(javascriptEvalString)`~~ | ✅ **Supprimé** — moteur V1 legacy mort | — |
| 3 | `engine/workspaceComponentExecutor/filter.js` | 128 | `eval(whereCondition)` | 🔴 Critique (RCE) | ✅ **Traité** : `validateExpression` avant exécution |
| 4 | `engine/workspaceComponentExecutor/arraySplitByCondition.js` | 62 | `eval(whereCondition)` | 🔴 Critique (RCE) | ✅ **Traité** : `validateExpression` avant exécution |
| 5 | `engine/workspaceComponentExecutor/MongoDB.js` | — | ~~`eval('collection.'+query)`~~ | ✅ **Supprimé** → `mongoQueryExecutor` (grammaire stricte) | — |
| 6 | `engine/utils/objectTransformationV2.js` | — | ~~double-eval base64~~ | ✅ **Supprimé** : `resolveString` durci (décodage direct sans eval) | — |
| 7 | `engine/workspaceComponentExecutor/regex.js` | 16 | `new RegExp(data.specificData.regex, 'gm')` | 🟠 Élevé (ReDoS) | ✅ **Traité** : `regexWorker.js` (worker terminable) + limites de longueur pattern/entrée + timeout |

**Les 5 sinks critiques sont traités** (validation AST + sanitisation + worker/timeout).

Notes :
- Aucun usage actif de `sift` ne subsiste dans le code serveur après la première phase de
  cette branche : tous les chemins statiques sont remplacés par des filtres natifs, le chemin
  `pull` du Filter est neutralisé (commenté), `joinByField` et `unicity` utilisent des filtres
  natifs avec **blocage des clés d'opérateur** (`$where`, `$regex`…).
- Le bundle navigateur `client/static/js/sift/` est hors périmètre (app client).
- Aucun `vm.*`, aucun `new Function(` direct dans le code serveur (hors la compilation interne
  de sift, désormais non appelée).

### 3.2 Éclaircissement demandé : le `eval` est-il encore utilisé par Loki ?

**Non.** La bibliothèque LokiJS n'évalue aucune chaîne : `collection.where(callback)` reçoit une
fonction JS. Le `eval` est appelé **par notre code**, dans le callback qu'on passe à
`collection.where` :

`filter.js` (chemin `filter()` → ligne 121) :

```js
resultData = collection.where((obj) => {
  const evaluation = eval(whereCondition);   // ← notre appel, pas Loki
  return evaluation == true;
});
```

`arraySplitByCondition.js` (`filterWithLoki` → ligne 57) :

```js
resultData = collection.where((obj) => {
  const evaluation = eval(whereCondition);   // ← notre appel, pas Loki
  return evaluation == true;
});
```

Conséquence : on peut supprimer l'`eval` de ces deux fichiers **sans toucher à Loki** — il
suffit de remplacer le callback par une évaluation encadrée (voir §5).

---

## 4. Détail des sinks critiques

### 4.1 `objectTransformationV2.js:118` — moteur de transformation (`=expr`)

Chemin d'entrée : tous les composants qui font passer une configuration par ce transformateur.

- `jsEvaluation.js:13` → `data.specificData.jsString` ;
- `objectTransformer.js` → `data.specificData.transformObject` ;
- `sort.js:28,176` → `JSON.parse(data.specificData.sortString)` ;
- `queryParamsCreation.js:8-13` → `data.specificData.queryParamsCreationObject` ;
- `filter.js:155` / `arraySplitByCondition.js:186` → le filtre résolu (dont `$where`) passe
  par ce transformateur avant le 2ᵉ `eval` du chemin Loki.

Le motif `=…` est transformé puis `eval`é avec les valeurs du flux intercalées sans
échappement.

### 4.2 ~~`objectTransformation.js:469/471` — `javascriptExec`~~ **SUPPRIMÉ**

Le moteur V1 legacy (`utils/objectTransformation.js`, `javascriptExec`) a été **supprimé** :
il n'était plus appelé depuis le refactoring `53f33e50` (juillet 2025), où `objectTransformer`
bascule sur la V2 (branches v1/v2 commentées, dropdown V1/V2 de l'UI commenté). Le sink V1
(469/471) n'existait donc plus qu'en surface.

**Aucune perte fonctionnelle** : l'exécution de JS arbitraire dans objectTransformer reste
possible via la V2 avec la syntaxe `=expr` (`objectTransformationV2.js:92-118`), déjà
couverte par le sink #1 (§4.1). La suppression élimine un doublon de sink RCE, pas la
capacité.

### 4.3 `filter.js:121` et `arraySplitByCondition.js:57` — `$where` / `conditionString`

`JSON.parse(specificData.filterString)` / `JSON.parse(specificData.conditionString)` ; si
l'objet ne contient que la clé `$where`, la chaîne est `eval`ée. `pullParams` non fiables
(endpoints anonymes) peuvent y être interpolés via `objectTransformation.execute(...)`.

### 4.4 `MongoDB.js:47` — `eval('collection.' + querySelect)`

`data.specificData.querySelect` (config membre) est interpolée (via `stringReplacer`) avec
`queryParams` et les données de flux, puis exécutée par `eval`. C'est le sink le plus grave :
couplé aux endpoints **sans auth** (`/engine/work-ask/:id`, `/data/api/*`), il peut être
exploité **sans compte utilisateur** si un connecteur Mongo existe dans le déploiement.

### 4.5 `regex.js:16` — ReDoS

`new RegExp(data.specificData.regex, 'gm')` appliqué à des données potentiellement
publiques/anonymes. Un motif catastrophique produit un déni de service du process engine.

---

## 5. Solutions retenues (décisions prises) et implémentation

### 5.1 Décisions validées

| Option | Décision | Justification |
|--------|----------|---------------|
| A. DSL déclaratif | ❌ **Écarté** | Des workflows en production utilisent déjà du JS (`eval`) ; un DSL casserait les configs existantes |
| B. Évaluation sandboxée (isolated-vm) | ❌ **Abandonné** — voie de garage | Le chargement des libs de master (dayjs, moment, sanitize-html, cheerio...) dans un isolate V8 nu requiert des shims natifs (`process`, `Buffer`, `stream`, `undici`...) impossibles à reconstruire fidèlement et coûteux ; le sandbox isolait l'exécution mais cassait la compatibilité des expressions |
| C. **Return au `eval` master + validation AST pré-éval** | ✅ **Retenu** | Reproduit exactement le comportement master (scope, libs par nom, encodage base64) tout en contrôlant statiquement le contenu AVANT l'exécution |
| D. Restriction par rôle | ❌ **Écarté** | Multi-tenant public, tous les utilisateurs doivent pouvoir créer des composants |

### 5.2 Implémentation réalisée (phase 2 — approche finale)

**Nouveau validateur `engine/utils/validateExpression.js`** — contrôle statique du contenu d'une
expression AVANT son `eval`, basé sur acorn (bonnes pratiques confirmées par recherche) :

- **Identifiants système interdits** : `process`, `require`, `module`, `exports`, `global`,
  `globalThis`, `Function`, `eval`, `console`, `Buffer`, `setImmediate`, `queueMicrotask`,
  `window`, `self`, `fetch`, `XMLHttpRequest`, `WebAssembly`, et les **modules natifs Node**
  (`fs`, `path`, `crypto`, `child_process`, `os`, `net`, `http`, `tls`, `worker_threads`, `vm`...).
- **Propriétés interdites** (axes d'évasion) : `constructor`, `__proto__`, `prototype`,
  `mainModule`, `_load`, `_compile`, `caller`, `callee`.
- **`new` limité à une whitelist** : `Date`, `RegExp`, `Map`, `Set`, `Error`, `Array`, `Object`,
  `Number`, `String`, `Boolean`, `BigInt`, `Promise`, `Symbol` (+ extensible via options).
- **Structures de code interdites** : boucles, assignations, déclarations de variables,
  fonctions/classes, imports, `with`, try/catch, tagged templates.
- **Appels de fonction "nus" restreints** : globals JS + libs sûres de master exposées par le
  scope (`dayjs`, `moment`, `removeMarkdown`, `decodeUnicode`, `he`, `sanitizeHtml`). Les appels
  de méthode (`.map`, `.filter`, `lodash.xxx`, `he.decode`...) restent libres, sauf les fonctions
  lodash de proto-pollution (`merge`, `set`, `defaultsDeep`...) désormais **interdites**.

Les expressions de transformation (`= expr`, `$where`) reviennent au **`eval` simple de master**,
avec le validateur appliqué juste avant l'exécution. Les valeurs `{$.x}`/`{£.x}` sont injectées
via le **mécanisme master base64** (`escapeString`/`resolveString`/`unicode`), ce qui préserve
fidèlement les clés/valeurs à caractères spéciaux/unicode (testé : `clé émoji☺`, emoji, accents).
Le scope eval expose les **libs de master** par leur nom (dayjs, moment, lodash, he,
removeMarkdown, ...) + les helpers (`dotProp`, `unicode`, `escapeString`, `resolveString`,
`parseAndResolveString`) pour une compatibilité 100% avec les configs de production.

| Sink | Correctif implémenté | Fichiers |
|------|----------------------|----------|
| `objectTransformationV2.js:118` (`=expr`) | **`eval` master + `validateExpression` avant exécution**. Valeurs injectées via base64 (escapeString/resolveString master). Libs de master exposées par le scope. `unicode-encode` + `moment` **réinstallés** | `utils/validateExpression.js`, `utils/objectTransformationV2.js` |
| `filter.js:121` (`$where`) | **`eval` simple + `validateExpression($where)` avant exécution** ; `$where` **conservé fonctionnel** | `workspaceComponentExecutor/filter.js` |
| `arraySplitByCondition.js:57` (`$where`) | Idem filter | `workspaceComponentExecutor/arraySplitByCondition.js` |
| `MongoDB.js:47` (`eval('collection.'+query)`) | **Supprimé** ; `mongoQueryExecutor` (grammaire stricte : méthodes whitelistées + args JSON uniquement, validation post-interpolation) | `utils/mongoQueryExecutor.js`, `workspaceComponentExecutor/MongoDB.js` |
| `objectTransformation.js` V1 (legacy) | **Supprimé** (moteur mort depuis 2025) | — |

### 5.3 Défense en profondeur (état)
1. **`POST /engine/work-ask/:componentId` sans auth** → ✅ **Corrigé** : signature **HMAC-SHA256**
   (`core/lib/hmac_lib.js`) exigée par la route engine ; le seul caller HTTP actif (timer
   scheduler, `workspace_lib._executeAllTimers`) signe ses requêtes. Body-binding + anti-replay.
2. **`/data/api/*`** (httpProvider) → ✅ **Décision** : **reste publique** (seul moyen d'appeler
   les endpoints de workflow). Protégée par une **limitation de débit par IP** (anti-DoS,
   `server/utils/rateLimiter.js`). La sécurité applicative relève du workflow.
3. **Validation de `specificData` à l'écriture** → ✅ **Corrigé** : `core/lib/specificDataValidator.js`
   (`validateSpecificData`) branché sur `workspace_component_lib._create`/`_update`
   (retrait clés dangereuses `__proto__`/`constructor`/`prototype` + getters, bornes profondeur/taille).
4. **`regex.js:16`** (ReDoS) → ✅ **Corrigé** : `regexWorker.js` (worker terminable) + limites de
   longueur de pattern/entrée + timeout (`runRegexInWorker`).

### 5.4 Pourquoi un `eval`/une conversion unicode existait dans master, et comment c'est préservé

### Rôle de la conversion unicode (`escapeString` / `unicode-encode`)

La conversion base64 (`unicode-encode` : `utoa`/`atou` — voir commit fondateur `64ecb8b0`
"secure transformer v2 to support any char in string", 2020) **ne servait pas au stockage**.
Elle servait à **transporter une valeur dans le code JS évalué sans casser la syntaxe** :

- Les patterns de transformation sont du **code source JS construit par concaténation**
  (`= expr`). Une valeur injectée **brute** (guillemets, backticks, backslashes, retours à la
  ligne, accents) casse la syntaxe de l'expression (démontré : `"O'Brien ` \ éà"` injecté brut
  → `Invalid or unexpected token`).
- `escapeString` encodait alors la valeur en **base64** (chaîne alphanumérique sûre), la
  collait dans le code, puis un `eval` interne (`resolveString`/`parseAndResolveString`) la
  décodait au moment de l'exécution → la valeur est restituée **intacte**.

L'encodage était donc un **échappement temporaire pendant l'évaluation**, jamais persisté.
Le `specificData` (schéma Mongoose `type: Object`) est stocké en MongoDB **en UTF-8 clair**,
avec les caractères unicode natifs — dans master comme dans la nouvelle version. Aucun encodage
n'est appliqué ni par le serveur (`workspaceWebService`), ni par la persistance
(`workspace_component_lib`), ni par l'éditeur client.

**Dans la nouvelle implémentation, le passage unicode est CONSERVÉ** : le transport base64
(`escapeString`/`resolveString`/`unicode`) est réutilisé exactement comme dans master pour
injecter les valeurs dans l'expression sans casser la syntaxe. `unicode-encode` et l'export
`.unicode` sont **réinstallés**. La différence : l'expression est **validée statiquement** avant
son `eval` (voir §5.2).

### Rôle du `eval` dans master et conservation

Le `eval` servait à deux choses distinctes :

| `eval` | Rôle | Conservation |
|--------|------|--------------|
| `eval(patternEval)` (fin de `execute`) | Exécuter l'expression de transformation **écrite par l'utilisateur** (`= expr`) : jsEvaluation, objectTransformer, sort, queryParamsCreation | ✅ **Conservé tel quel** (retour au scope master), **précédé de `validateExpression`** |
| `eval` interne de décodage (dans `resolveString`) | Décoder les valeurs base64 encodées | ✅ **Conservé mais durci** : `resolveString` n'évalue plus que la forme EXACTE `eval(this.unicode.atou(\`...\`))` produite par `escapeString` ; toute autre string est retournée sans eval (empêche un contournement via une valeur utilisateur) |

Bilan fonctionnel : les fonctionnalités de master sont **toutes préservées** — expressions
`= expr`, injection de valeurs à caractères spéciaux/unicode, objets à clés spéciales type
`clé émoji☺`, libs de master accessibles par nom (dayjs, moment, lodash, he, removeMarkdown...).
Vérifié par tests. Aucun `eval` non validé n'est exécuté.

---

## 6. Points d'attention / pièges identifiés

- L'interpolation de `pullParams` / données de flux dans des chaînes **sans échappement**
  (`stringReplacer`), amplifie tous les sinks : à supprimer même si on garde du JS.
- `whereCondition.replace(/this/g, 'obj')` ne protège rien : il casse les chaînes contenant
  « this » et n'empêche pas l'exécution. Ne pas s'en servir comme justification.
- Le maintien de Loki (pas de `eval` interne) signifie que les chemins "Loki" peuvent être
  sécurisés par un simple remplacement de la branche `$where`.
- Les données issues de `/data/api/*` et du fragment store (Scylla) alimentent `flowData` :
  même sans composant critique, un connecteur Mongo avec un `querySelect` interpolié peut être
  exploité de manière **anonyme**.
- Garder une **matrice de compatibilité** des configurations existantes : certains workflows
  en production utilisent sûrement `jsString`, `transformObject`, `sortString` et `$where`.
  Toute suppression d'expression JS doit prévoir une migration de ces configurations.

---

## 7. Travaux réalisés

### Phase 1 — retrait de sift et du code mort

| Changement | Fichiers |
|------------|----------|
| Suppression de tous les usages actifs de `sift` (filtres statiques → `.filter()/.find()` natifs) | `core/lib/{user_lib,workspace_lib,workspace_component_lib,bigdataflow_lib}.js`, `engine/services/engine.js` |
| `joinByField` converti en filtres natifs — jointure par **égalité simple** (`item[field] === value`), alignée sur le chemin Loki existant (`collection.find`). L'interface (`join-by-field-editor.tag`) n'expose que des noms de propriété, pas de filtrage complexe : un garde-fou d'opérateur `$` est donc inutile (aucune exécution de requête) | `engine/workspaceComponentExecutor/joinByField.js` |
| `unicity` converti en filtres natifs (`deepEquals` local, sans `$where` possible) | `engine/workspaceComponentExecutor/unicity.js` |
| Code mort `pull`/`sift` du Filter neutralisé (commenté avec explication) | `engine/workspaceComponentExecutor/filter.js` |
| **Moteur de transformation V1 supprimé** (`objectTransformation.js`, `javascriptExec`) — n'était plus appelé depuis juillet 2025 ; élimine le sink RCE #2. Tests `.disabled` associés retirés | `engine/utils/objectTransformation.js`, `engine/workspaceComponentExecutor/objectTransformer.js`, `engine/__tests__/utils/*.disabled`, `engine/__tests__/README_TESTS_DISABLED.md` |
| Suppression de la dépendance `sift` des `package.json` (core + engine) + lockfile | `package.json`, `package-lock.json` |

### Phase 2 — sécurisation des sinks `eval` (validation AST + retour au scope master)

| Changement | Fichiers |
|------------|----------|
| **Validateur AST** (`validateExpression`) : acorn, deny-list identifiants système + modules natifs + propriétés d'évasion, whitelist `new`, interdiction des structures de code, interdiction des fonctions lodash de proto-pollution | `engine/utils/validateExpression.js` |
| **Sécurisation de l'exécution** (`evalSecurity`) : `sanitizeValue` (retrait getters + clés dangereuses `__proto__`/`constructor`/`prototype`), `evalWithTimeout` (prévu, non câblé car `eval` synchrone), liste des fonctions lodash dangereuses | `engine/utils/evalSecurity.js` |
| `objectTransformationV2` : **retour au `eval` master** + `validateExpression` avant exécution + `sanitizeValue` sur les valeurs injectées + `resolveString` durci (décodage strict sans eval arbitraire). `unicode-encode` + `moment` réinstallés | `engine/utils/objectTransformationV2.js` |
| `filter.js` / `arraySplitByCondition.js` `$where` : **`eval` simple + `validateExpression` avant exécution** | `workspaceComponentExecutor/{filter,arraySplitByCondition}.js` |
| `MongoDB.js` `eval('collection.'+query)` **supprimé** → `mongoQueryExecutor` (grammaire stricte post-interpolation) | `engine/utils/mongoQueryExecutor.js`, `workspaceComponentExecutor/MongoDB.js` |
| **Abandon du sandbox isolated-vm** : suppression `safeEvaluate.js`, bundle esbuild, shims, dépendances `isolated-vm`/`esbuild` | — |
| Tests unitaires (validateur 22, objectTransformationV2 20, filter $where 8, arraySplit 4, mongoQueryExecutor 21, ...) = **86 tests engine + 11 core** | `engine/__tests__/**` |

### Phase 3 — isolation (worker/timeout), auth, validation à l'écriture

| Changement | Fichiers |
|------------|----------|
| **`execute`/`executeWithParams` async** + `eval` dans un **worker_threads terminable** avec timeout (`runEvalInWorker`, `evalWorker.js`) ; scope master reproduit (libs par nom + helpers + source/pullParams/options/config) ; callers mis à jour (`await`) | `engine/utils/{evalSecurity,evalWorker,objectTransformationV2}.js`, `workspaceComponentExecutor/{filter,arraySplitByCondition,sort,jsEvaluation,objectTransformer,queryParamsCreation}.js`, `services/engine.js` |
| **`regex.js` ReDoS** : exécution dans un worker terminable avec limites (pattern 2048, entrée 10 MB, timeout 2 s) | `engine/utils/{evalSecurity,regexWorker}.js`, `workspaceComponentExecutor/regex.js` |
| **Auth `/engine/work-ask/:componentId`** : signature HMAC-SHA256 exigée (body-binding + anti-replay) | `core/lib/hmac_lib.js`, `engine/communication/index.js`, `core/lib/workspace_lib.js` |
| **`/data/api/*`** : publique + rate-limit IP anti-DoS (configurable) | `main/server/utils/rateLimiter.js`, `main/server/workspaceComponentInitialize/httpProvider.js` |
| **Validation `specificData` à l'écriture** (retrait `__proto__`/`constructor`/`prototype` + getters, bornes profondeur/taille) | `core/lib/specificDataValidator.js`, `core/lib/workspace_component_lib.js` |
| **Matrice de compatibilité** (libs de prod : dayjs, moment, this.moment, lodash, he, removeMarkdown, sanitizeHtml, cheerio, decodeUnicode) ; `cheerio` ajouté au scope worker | `engine/__tests__/utils/compatibilityMatrix.test.js`, `engine/utils/evalWorker.js` |
| Tests : timeout eval, regex, hmac, specificData, compatibilité = **100 engine + 23 core** | `engine/__tests__/**`, `core/__tests__/**` |

---

## 8. Actions restantes (phase 3 et au-delà)

- [x] **Timeout de l'évaluation (point 3)** : `execute`/`executeWithParams` désormais **async**,
      le `eval` s'exécute dans un **`worker_threads` terminable** (`evalWorker.js`,
      `runEvalInWorker`) avec timeout strict et scope isolé (plus d'accès aux variables du
      process principal). Les callers sont mis à jour avec `await`.
- [x] **`regex.js`** — ReDoS : `regexWorker.js` (worker terminable) + limites de longueur
      pattern/entrée + timeout (`runRegexInWorker`).
- [x] **`$where` (filter/arraySplitByCondition)** : exécuté dans le **eval-service (container)**
      via `runWhereInRemote` (route `/where`, isolation + timeout). Le `$where` (validé par
      `validateExpression`) n'est plus `eval`é dans le process principal (fini le callback Loki).
      Le `runWhereInWorker` local reste comme moteur de référence des tests unitaires.
- [x] **Matrice de compatibilité** : les patterns réels de la base prod `semantic-bus-prod-all`
      (8 604 composants) sont extraits et validés — **8 604/8 604 compatibles** (dayjs, moment,
      `this.moment`, lodash, he, removeMarkdown, sanitizeHtml, cheerio, decodeUnicode, crypto,
      `eval('new ' + ...)` Date, Buffer). Détail : `specifications/compatibility-matrix-prod.md`.
- [x] Valider `specificData` à l'écriture des composants : `specificDataValidator.js` branché
      sur `workspace_component_lib._create`/`_update`.
- [x] **Auth `/engine/work-ask/:componentId`** : signature HMAC exigée (`hmac_lib.js`), caller
      interne signé. **`/data/api/*`** : décision = publique + rate-limit IP (`rateLimiter.js`).
- [x] **`crypto` dans les expressions** : exposé comme **référence maîtrisée** du scope du worker
      (`Object.defineProperty(globalThis, 'crypto', ...)`) et retiré de
      `FORBIDDEN_IDENTIFIERS` → `= crypto.createHash(...)` / `crypto.randomUUID()` à nouveau
      utilisables (4 composants en prod).
- [ ] Re-audit externe après correction + coordination de la divulgation. ✅ Tests de
      non-régression à jour (engine 131, core 50, timer 17, eval-service 25 : 10 unitaires pool + 15 d'intégration).
- [ ] Coordonner la divulgation (GitHub Security Advisory, CVE, répondeur).

---

## 8.5 Architecture et performance du `eval-service` (container d'évaluation isolé)

Le `eval-service` (`packages/eval-service/`) est le **seul moteur d'évaluation** du logiciel
(transformations `= expr`, `$where`). L'engine ne fait plus de `eval` dans son process
principal : il appelle le container en HTTP signé.

### Flux d'appel

1. L'engine (`objectTransformationV2.execute`) résout les `{$.x}`/`{£.x}` **à l'extérieur**
   du container : chaque valeur devient une variable `vN`, envoyée séparément dans `variables`.
   Le container ne reçoit que l'expression épurée + les variables.
2. **Signature HMAC sur octets bruts** (`signBuffer`/`verifyBuffer`) : l'engine sérialise le
   corps **une seule fois** (`Buffer.from(JSON.stringify(body))`), le signe, et l'envoie tel
   quel. Le service lit le corps en **octets bruts** (`express.raw()`), vérifie la signature
   sur ces mêmes octets (`verifyBuffer`), puis fait **un seul `JSON.parse`**. → 1 sérialisation
   à l'émetteur + 1 parse au récepteur, **0 re-sérialisation canonique** de vérification
   (contrairement à `sign`/`verify` sur objets, utilisés pour l'AMQP/work-ask).
3. **Agent HTTP keep-alive** (`http.Agent({ keepAlive: true })`) partagé côté engine : les
   sockets TCP vers le eval-service sont réutilisés entre requêtes (plus de handshake par éval).

### Isolation & performance (worker pool)

- Chaque éval s'exécute dans un **worker_threads** du container, **persistant** (créé au boot,
  pas de `new Worker` par requête). Les libs (dayjs, moment, lodash, cheerio, ...) sont
  chargées **une seule fois** au démarrage du worker.
- **Aucun passage d'état entre deux évals** : chaque job s'exécute dans un **contexte `vm`
  neuf** (`vm.runInContext`), et les libs/helpers partagés sont **gelés** (`Object.freeze`).
  Une éval ne peut pas laisser de global, muter un helper, ni polluer un prototype vers le job
  suivant. Pas de recyclage périodique.
- **File FIFO** (`WorkerPool`) quand tous les workers sont occupés ; tailles configurables par
  env (`EVAL_POOL_SIZE`=4, `WHERE_POOL_SIZE`=2, `EVAL_MAX_QUEUE`=200).
- **Timeout** : `vm` timeout coupe les boucles JS ; en secours, le worker est **terminé et
  remplacé** (couvre aussi les regex natives catastrophiques que le timeout vm ne peut pas
  interrompre). Un worker qui meurt est remplacé, son job en cours rejeté.
- `require`/`module`/`process`/`global`/`console` sont retirés du `globalThis` du worker
  (`workerGlobals.js`) → un `eval` interne ne peut pas accéder au système.

### Ordres de grandeur

Mesuré en prod (engine → eval-service, bout en bout) : **~6-7 ms/éval** (contre ~900 ms avec
l'ancien `new Worker(...)` par évaluation, soit ~90× plus rapide). La suite d'intégration du
eval-service est passée de ~15 s à ~1.6 s.

### Tests

- **Unitaires pool** (`workerPool.test.js`) : isolation d'état, FIFO, timeout → remplacement,
  file pleine, crash → remplacement. 10 tests.
- **Intégration** (`eval-service.integration.test.js`) : cas réels de prod (dayjs, moment,
  he.decode, crypto, eval Date, Buffer, clés unicode, $where) + sécurité (require/process
  inaccessibles, signature) + isolation d'état et timeout via HTTP. 15 tests.

---

## 9. Correspondance avec le rapport du chercheur (traçabilité)

| # | Remarque du chercheur (Maxim Yakovlev) | Statut | Référence |
|---|----------------------------------------|--------|-----------|
| R1 | Sink sift `$where` → `new Function` dans `filter.js` exécute `filterString`/`specificData` | ✅ Traité : chemin `pull` neutralisé, sift retiré de `filter.js` | §3.1, §7 |
| R2 | Sink `eval()` brut dans `filter.js` (chemin Loki) | ✅ **Traité** : `$where` validé par `validateExpression` avant `eval` (conservé fonctionnel) | §3.2, §5.2, §7 |
| R3 | `POST /workspaces/` sans `wrapperSecurity` → tout utilisateur JWT peut créer un workspace avec composants arbitraires | 🔲 À corriger : aligner la politique d'autorisation + validation `specificData` à l'écriture | §5.3, §8 |
| R4 | Attaquant (même rôle `editor`) peut déposer un Filter malveillant exécuté à la prochaine exécution du workflow | ✅ Surface neutralisée : `$where` validé avant `eval` (plus de RCE via le composant) | §2.1, §5.2 |
| R5 | sift `^17.1.3` sans CSP mode | ✅ Dépendance sift retirée du code serveur | §7 |
| R6 | Coordination CVE / GHSA / délai 90 j | 🔲 À organiser (hors branche) | §8 |
| R7 | (Découverte interne) Sink `eval` dans `joinByField`/`unicity` via clés opérateur | ✅ Traité : `joinByField` = égalité simple native, `unicity` sans `$where` | §7 |
| R8 | (Découverte interne) Autres sinks `eval` (`MongoDB.js`, `objectTransformation*`, `jsEvaluation`) | ✅ **Traité** : V1 supprimé, `objectTransformationV2` validé avant `eval` + `sanitizeValue`, `MongoDB.js` sans eval (grammaire stricte), `jsEvaluation` passe par `objectTransformationV2` validé | §3.1, §5.2, §7 |
| R9 | (Découverte interne) Endpoints d'exécution **sans auth** (`/engine/work-ask/:componentId`, `/data/api/*`) **et file AMQP/STOMP `work-ask`** | ✅ **`/engine/work-ask/:componentId`** : HMAC exigé (caller interne). **File `work-ask`** : consumer engine exige HMAC (caller interne : timer/httpProvider/upload signés) OU **JWT valide + autorisation** (navigateur, `engineWorkAuth`) ; le navigateur obtient ses credentials STOMP via `GET /data/auth/stomp-credentials` (API JWT) et envoie son JWT dans le message. **`/data/api/*`** : publique (décision) + rate-limit IP anti-DoS | §2.2, §5.3, §8 |