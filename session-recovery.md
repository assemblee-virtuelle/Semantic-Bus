# Session Recovery — Branche `security/remove-sift-and-secure-eval`

> Ce fichier permet de reprendre le travail là où il s'est arrêté (session interrompue).
> Branche : `security/remove-sift-and-secure-eval` (créée depuis `production`).
> Dépôt : `/home/simon/GIT/Bus/Semantic-Bus`.

---

## 1. Contexte général

Sécurisation d'une **RCE via les `eval` de l'engine** (signalée par Maxim Yakovlev, divulgation
coordonnée, 90 jours). Approche adoptée en définitive (après plusieurs virages) :

- **Phase 1** : retrait complet de `sift` (remplacé par filtres natifs) + suppression du moteur
  de transformation V1 mort + code mort `pull` du Filter. ✅ **Terminé et validé.**
- **Phase 2** : retour au **`eval` de master** + **validateur AST** (`validateExpression`) avant
  toute exécution + **sanitisation** des données injectées (`evalSecurity`). ✅ **Implémenté.**
- L'**isolated-vm** (sandbox) a été **abandonné** : voie de garage (shims natifs impossibles pour
  les libs de master, casse de compatibilité). Voir spec §5.1-B.

---

## 2. État exact du code (à reprendre)

### Fichiers modifiés/créés (dans la branche)

| Fichier | Rôle | État |
|---|---|---|
| `packages/engine/utils/validateExpression.js` | Validateur AST (acorn) : deny-list identifiants système + modules natifs + propriétés d'évasion, whitelist `new`, interdit structures de code, interdit fonctions lodash proto-pollution (`merge`/`set`/`defaultsDeep`...) | ✅ Fini, 0 erreur lint |
| `packages/engine/utils/evalSecurity.js` | `sanitizeValue` (getters + clés dangereuses), `runEvalInWorker`/`runWhereInWorker` (worker_threads local = **moteur de test**), `runRegexInWorker` (regex worker), **`runEvalInRemote`/`runWhereInRemote`** (appel HTTP signé au eval-service, moteur prod), liste `LODASH_PROTO_POLLUTION_FUNCS` | ✅ Fini, 0 erreur lint |
| `packages/engine/utils/evalWorker.js` | Worker d'exécution du `eval` (scope master reproduit, `this`→global, terminable) | ✅ Créé |
| `packages/engine/utils/regexWorker.js` | Worker d'exécution du `matchAll` (terminable) | ✅ Créé |
| `packages/engine/utils/objectTransformationV2.js` | `execute`/`executeWithParams` **async** : `validateExpression` avant exécution + `sanitizeValue` sur valeurs injectées + `resolveString` durci + **eval en worker (timeout)**. `unicode-encode` + `moment` réinstallés | ✅ Fini |
| `packages/engine/workspaceComponentExecutor/filter.js` | `$where` → `eval` simple + `validateExpression` avant exécution ; caller `execute` awaité | ✅ Fini |
| `packages/engine/workspaceComponentExecutor/arraySplitByCondition.js` | idem filter ; caller `execute` awaité | ✅ Fini |
| `packages/engine/workspaceComponentExecutor/sort.js` | caller `execute` awaité | ✅ Fini |
| `packages/engine/workspaceComponentExecutor/jsEvaluation.js` | caller `execute` awaité | ✅ Fini |
| `packages/engine/workspaceComponentExecutor/objectTransformer.js` | `jsonTransform`/`transformItem`/`pull` async (`executeWithParams`) | ✅ Fini |
| `packages/engine/workspaceComponentExecutor/queryParamsCreation.js` | `buildQueryParam` async | ✅ Fini |
| `packages/engine/workspaceComponentExecutor/regex.js` | ReDoS : exécution via `runRegexInWorker` (worker terminable + limites) | ✅ Fini |
| `packages/engine/services/engine.js` | `buildPathResolution` async + `buildQueryParam` awaité | ✅ Fini |
| `packages/engine/communication/index.js` | `POST /work-ask/:componentId` exige une **signature HMAC** | ✅ Fini |
| `packages/engine/utils/mongoQueryExecutor.js` | Requêtes Mongo sécurisées (grammaire stricte, post-interpolation) | ✅ Fini |
| `packages/engine/workspaceComponentExecutor/MongoDB.js` | Utilise `mongoQueryExecutor` (plus d'eval) | ✅ Fini |
| `packages/core/lib/hmac_lib.js` | Signature HMAC-SHA256 (`sign`/`verify`) + `signMessage`/`verifyMessage` (messages AMQP work-ask) | ✅ Créé |
| `packages/core/lib/engineWorkAuth.js` | Autorisation des messages `work-ask` : JWT valide + rôle owner/editor sur le workspace (admin via `adminUsers`) | ✅ Créé |
| `packages/core/lib/workspace_lib.js` | `_executeAllTimers` signe ses requêtes HMAC vers l'engine | ✅ Fini |
| `packages/core/timerScheduler.js` | Messages `work-ask` signés HMAC (`signMessage`) | ✅ Fini |
| `packages/engine/communication/index.js` | Consumer `work-ask` : vérifie HMAC (caller interne) OU JWT+autorisation (navigateur) ; endpoint HTTP exige HMAC | ✅ Fini |
| `packages/core/lib/specificDataValidator.js` | Validation/sanitisation `specificData` à l'écriture (clés dangereuses + getters + bornes) | ✅ Créé |
| `packages/core/lib/workspace_component_lib.js` | `_create`/`_update` appliquent `validateSpecificData` | ✅ Fini |
| `packages/main/server/utils/rateLimiter.js` | Rate-limit par IP (anti-DoS) pour `/data/api/*` (mono-instance) | ✅ Créé |
| `packages/main/server/workspaceComponentInitialize/httpProvider.js` | `/api/*` publique + rate-limit IP ; messages `work-ask` signés HMAC | ✅ Fini |
| `packages/main/server/workspaceComponentInitialize/upload.js` | Messages `work-ask` signés HMAC | ✅ Fini |
| `packages/main/server/authWebService.js` | `GET /data/auth/stomp-credentials` (API JWT) fournit les credentials STOMP au navigateur | ✅ Fini |
| `packages/main/config.json` | Ajout `amqpStompLogin`/`amqpStompPassword` (surchargeables par env) | ✅ Fini |
| `packages/main/client/static/application.html` | Récupère les credentials STOMP via `/data/auth/stomp-credentials` (JWT) au lieu de `guest/guest` | ✅ Fini |
| `packages/main/client/static/store/workspaceStore.js` | Envoie le JWT dans le message `work-ask` | ✅ Fini |
| `packages/eval-service/` | Service d'évaluation isolé en container : `app.js` (API HTTP signée `/eval`+`/where`), `evalWorker.js`/`whereWorker.js` (worker_threads internes terminables), `workerGlobals.js`, `Dockerfile` | ✅ Créé |
| `packages/core/lib/hmac_lib.js` | `secret()` lit `process.env.ENGINE_HMAC_SECRET` en priorité (partage de secret engine↔eval-service) | ✅ Fini |
| `specifications/security-eval-and-code-execution.md` | Spec mise à jour (phases 1-3, défense en profondeur, traçabilité) | ✅ À jour |
| `session-recovery.md` | Ce fichier | ✅ |

### Suppressions dans la branche
- `packages/engine/utils/objectTransformation.js` (moteur V1)
- `packages/engine/utils/safeEvaluate.js`, `isolate-package.json`, `isolate.bundle.cjs`, `scripts/build-isolate.js` (abandon isolate)
- Dépendances `isolated-vm`, `esbuild` retirées des package.json + node_modules
- Tests `.disabled` obsolètes (V1) supprimés

### Tests
- **Engine : 10 suites, 100 tests passent** (`cd packages/engine && npx jest`)
- **Core : 5 suites, 38 tests passent** (`cd packages/core && npx jest`)
  (11 initiaux + 6 hmac + 6 specificData + 6 hmac signMessage + 9 engineWorkAuth)
- Lint : 0 erreur sur les fichiers modifiés/créés de cette branche. Les erreurs de style
  (`no-async-promise-executor`, `semi`, ...) sont **pré-existantes** dans le codebase
  (`filter.js`, `arraySplitByCondition.js`, `objectTransformer.js`, ...) et cohérentes avec
  le pattern `new Promise(async ...)` déjà utilisé partout.

---

## 3. Ce qui est couvert (sécurité)

- `eval` des transformations (`= expr`) et `$where` : **validés par AST avant exécution**
  (interdits : process, require, module, exports, globalThis, Function, eval, console, Buffer,
  fs/path/crypto/child_process/os/vm... ; propriétés constructor/__proto__/prototype/mainModule ;
  `new` hors whitelist ; boucles/assignations/déclarations/fonctions/classes/with/try-catch).
- **Prototype pollution** : `sanitizeValue` filtre `__proto__`/`constructor`/`prototype` dans les
  données injectées ET le validateur interdit `lodash.merge`/`set`/`defaultsDeep`/... .
- **Getters** : `sanitizeValue` ne lit que les data descriptors → aucun getter déclenché.
- **`resolveString` durci** : n'évalue plus que la forme exacte `eval(this.unicode.atou(...))`
  produite par `escapeString` (empêche un contournement via valeur utilisateur).
- **MongoDB** : plus d'eval, grammaire stricte de méthodes + args JSON.

---

## 4. Ce qui est fait / ce qu'il reste à faire (prioritaire)

### ✅ Fait dans cette reprise (suite de la session)

0. **Fix HMAC : normalisation du corps avant signature (ObjectId mongo)** —
   `canonicalStringify` d'un ObjectId retournait `{}` (propriétés non énumérables)
   → la signature était calculée sur `"id":{}` alors que le vérificateur reçoit le
   corps après un aller-retour JSON (`"id":"<hex>"`) → refus systématique des
   work-ask du httpProvider/upload (`unauthenticated message refused`) et des
   appels HTTP du timer/eval-service. `hmac_lib.sign()` normalise désormais le
   corps (`JSON.parse(JSON.stringify(body))`) avant le calcul. 2 tests ajoutés.
   Commit `9e63c450`.

1. **Câbler le timeout (point 3)** — `runEvalInWorker` dans `evalSecurity.js` exécute
   le `eval` des transformations dans un **`worker_threads` TERMINABLE** (`evalWorker.js`),
   avec un timeout strict (configurable via `config.evalTimeoutMs`, défaut 10 s). Le `eval`
   est isolé : il n'accède plus aux variables/modules du process principal. `execute()`
   et `executeWithParams()` sont **désormais async (Promise)** ; les ~10 callers
   (`filter.js`, `arraySplitByCondition.js`, `sort.js`, `jsEvaluation.js`,
   `objectTransformer.js`, `queryParamsCreation.js` → `engine.js`) sont mis à jour avec
   `await`. Le scope master (libs par nom + helpers + `source`/`pullParams`/`options`/
   `config`) est reproduit dans le worker. Tests ajoutés (timeout réel, sérialisation).
2. **`regex.js` (ReDoS)** — le motif utilisateur est appliqué via un
   **`regexWorker.js`** (worker terminable) avec limites de longueur de pattern (2048) et
   d'entrée (10 MB) + timeout (défaut 2 s) → `runRegexInWorker`. Tests ajoutés (dont
   interruption d'un motif catastrophique).
3. **Auth `POST /engine/work-ask/:componentId`** — audit des callers : le seul caller HTTP
   actif est le timer scheduler interne (`workspace_lib._executeAllTimers`). Ajout d'une
   **signature HMAC-SHA256** (`core/lib/hmac_lib.js`, `sign`/`verify`) exigée par la route
   engine ; le caller interne est mis à jour pour signer. Body-binding + anti-replay
   (timestamp). Tests ajoutés.
4. **Auth `/data/api/*` (httpProvider)** — **volontairement publique** (seul moyen d'appeler
   les endpoints de workflow) ; ajout d'une **limitation de débit par IP** (anti-DoS,
   `server/utils/rateLimiter.js`, configurable). La sécurité applicative relève du workflow.
5. **Validation `specificData` à l'écriture** — `core/lib/specificDataValidator.js`
   (`validateSpecificData`) branché sur `workspace_component_lib._create` et `_update` :
   retire `__proto__`/`constructor`/`prototype` (proto-pollution) + getters, borne
   profondeur/taille. Tests ajoutés.
6. **Matrice de compatibilité** — jeu de tests d'acceptation
   (`__tests__/utils/compatibilityMatrix.test.js`) couvrant les libs de prod documentées
   (dayjs, moment, this.moment, lodash, he, removeMarkdown, sanitizeHtml, cheerio,
   decodeUnicode). `cheerio` ajouté au scope du worker. **Voir le point 14 : les patterns
   réels de la base prod ont depuis été extraits et validés (aucune casse).**
7. **Sécurisation du vecteur STOMP/AMQP `work-ask`** — le consumer engine exige désormais
   une authentification sur chaque message :
   - **Caller interne** (timer scheduler, httpProvider, upload) : messages **signés HMAC**
     (`hmac_lib.signMessage`/`verifyMessage`) ;
   - **Navigateur (STOMP)** : porte un **JWT**, avec vérification **JWT valide + autorisation**
     (`core/lib/engineWorkAuth.js`) — admin (si `adminUsers` configuré) OU rôle
     `owner`/`editor` sur le workspace du composant. ⚠️ Ne se fie PAS au `admin=true` par
     défaut de `getWithRelations` (sinon tout utilisateur JWT serait admin).
   - Le frontend **n'envoie plus `guest/guest`** : il récupère les credentials RabbitMQ via
      `GET /data/auth/stomp-credentials` (**API authentifiée JWT**), et envoie son JWT dans le
      message `work-ask`. Config : `amqpStompLogin`/`amqpStompPassword` (config + env).
8. **RabbitMQ configuré "au montage" (plus d'image customisée)** — le service `rabbitmq` des
   docker-compose utilise désormais l'image standard **`rabbitmq:3-management`** avec des
   **volumes montés** (pas d'image `semanticbus/rabbitmq-stomp` buildée) :
   - `rabbit/rabbitmq-definitions.json` : crée le user **`stomp-user`** (dédié, tags
     `monitoring`) — **le user `guest` a été supprimé** + vhosts (`/`, `devLocal`,
     `dataPlayersProd`) + queue `work-ask`.
   - `rabbit/rabbitmq.conf` : `load_definitions` au démarrage + écouteurs STOMP/web-stomp/management.
   - `rabbit/entrypoint.sh` : active les plugins `rabbitmq_stomp`/`rabbitmq_web_stomp`/management
     au démarrage.
   - Volume `rabbitmq_data` pour la persistance.
9. **Services (engine/main/timer) connectés avec le user sécurisé `stomp-user`** — via
   `core/lib/amqpUrl.js` (`buildAmqpUrl`), les 3 `app.js` construisent l'URL AMQP avec les
   credentials dédiés (`amqpStompLogin`/`amqpStompPassword` de la config, surchargeables par
   env `AMQP_STOMP_LOGIN`/`AMQP_STOMP_PASSWORD`). Les docker-compose définissent ces env avec
   défaut `stomp-user`/`change-me-stomp-password`. Plus de connexion en `guest/guest`.
10. **Commandes make pour l'infra RabbitMQ** :
    - `make rabbit-up` : (re)crée le conteneur rabbitmq.
    - `make rabbit-reset` : **reconstruit proprement** RabbitMQ (stop + rm + suppression du
      volume `rabbitmq_data` + up) → recharge les définitions (users/vhosts/queues) au démarrage.
    - Le user `stomp-user` est défini avec son **mot de passe en clair** dans les définitions
      (dev, pas un vrai secret ; la prod est dans un repo privé séparé). Pour changer le mot de
      passe : éditer `"password"` dans `rabbit/rabbitmq-definitions.json` + `amqpStompPassword`
      (config) puis `make rabbit-reset`.
11. **`$where` (filter/arraySplitByCondition) exécuté dans le eval-service (container)** — la
    condition `$where` (validée par `validateExpression`) est évaluée via `runWhereInRemote`
    (route `/where` du eval-service), cohérent avec le transformateur : isolation + timeout
    (protection ReDoS/DoS). Fini le `eval` dans le process principal (callback Loki).
    ⚠️ **Voir point 17 : le worker_threads local (`runWhereInWorker`) n'est plus utilisé en prod
    — il sert uniquement de moteur de référence dans les tests unitaires (mock).**
12. **`crypto` exposé (lib de prod restaurée)** — retiré de `FORBIDDEN_IDENTIFIERS` du
    validateur et exposé comme référence maîtrisée dans le scope du worker
    (`Object.defineProperty(globalThis, 'crypto', ...)` car `globalThis.crypto` est un
    accessor natif configurable). Les expressions `= crypto.createHash(...)` /
    `crypto.randomUUID()` sont à nouveau utilisables. Par ailleurs, le blocage des fonctions
    lodash de proto-pollution a été **restreint au récepteur lodash/underscore** (un
    `crypto.createHash().update()` n'est plus bloqué à tort).
13. **Advisory de sécurité préparé** — `advisories/2026-08-semantic-bus-rce-eval.md`
    (brouillon de divulgation coordonnée, sections GHSA/CVSS/CWE/crédit/timeline, bonnes
    pratiques issues d'une recherche Perplexity) + `SECURITY.md` (politique de signalement).
14. **Matrice de compatibilité prod validée (aucune casse)** — extraction des patterns réels
    depuis la base prod `semantic-bus-prod-all` (8 604 composants) :
    - Libs utilisées : `he` (485), `dayjs` (36), `crypto` (4), `moment`/`this.moment` (2),
      `removeMarkdown` (5), `decodeUnicode` (5), `sanitizeHtml` (4), `cheerio` (1). Toutes couvertes.
    - **`eval('new ' + ...)`** (construction de Date, 3 composants) et **`Buffer.from(...)`**
      (2 composants) : désormais **supportés** sans casse. `eval` est autorisé au niveau du
      validateur, MAIS la barrière de sécurité effective est le **worker isolé** :
      `require`/`module`/`process`/`global`/`console` sont **retirés du `globalThis` du worker**
      (`utils/workerGlobals.js`) avant toute évaluation → un `eval` interne ne peut PAS accéder
      au système. Timeout appliqué.
    - Résultat : **8 604/8 604 composants compatibles**.
    - Fichier : `specifications/compatibility-matrix-prod.md`.
15. **Config prod préparée** (`semantic-bus-prod-all/`) — `config.json` (ajout
     `amqpStompLogin`/`amqpStompPassword`), `docker-compose.yaml` (rabbitmq standard + volumes +
     eval-service avec config.json montée, **aucune env**, pas de `.env`), `rabbit/custom_definitions.json`
     (user `stomp-user`, mot de passe fort réel committé — repo privé, **guest supprimé**),
     `rabbit/rabbitmq.conf` + `entrypoint.sh`, Makefile (`rabbit-reset`).
     ⚠️ **Stratégie de config du projet : tout est dans `config.json`** (MongoDB, SMTP,
     Google OAuth, Stripe, `amqpStomp*`, `secret`). Même le eval-service monte `config.json`
     pour lire le secret HMAC (symlink `@semantic-bus/engine` dans l'image).
16. **User `guest` supprimé** — vérifié non utilisé (frontend via stomp-user, services via
    stomp-user) → retiré des définitions RabbitMQ (repo principal + prod). Plus aucun user
    `guest` avec droits.
17. **Service d'évaluation isolé en container (`eval-service`)** — les évals JS du logiciel
    (transformations `= expr`, `$where`) ne tournent plus dans le process de l'engine mais
    dans un **container dédié** (`packages/eval-service`), qui est le **seul moteur d'évaluation**
    (pas de fallback : si le container est injoignable → erreur) :
    - **API HTTP signée HMAC** (`POST /eval`, `POST /where`) — body lisible :
      `{ "expression": "...", "variables": { "v0": ... } }`.
    - **Résolution des `$`/`£` À L'EXTÉRIEUR** du container : l'engine (`objectTransformationV2`)
      remplace chaque `{$.path}`/`{£.path}` par une variable `vN` et envoie les valeurs séparément
      dans `variables`. Le container ne reçoit que l'expression épurée + les variables.
    - **Isolation totale** : chaque éval s'exécute dans un **worker_threads interne terminable**
      (timeout), `require`/`process`/`global`/`console` sont retirés du `globalThis` →
      pas d'accès système par `eval`. Le container n'a pas accès aux autres services/volumes.
    - Le worker_threads local de l'engine (`runEvalInWorker`) reste comme **moteur de test**
      (mock dans les tests unitaires) — la prod passe par le container (`runEvalInRemote`).
    - **Docker** : service `eval-service` ajouté aux docker-compose (principal + prod),
      `EVAL_SERVICE_URL` défini sur l'engine (seul service qui évalue).
    - **Tests** : `make test-eval` (démarre le container + lance les 13 tests d'intégration
      avec les cas réels de prod : dayjs, moment, he.decode, crypto, eval Date, Buffer,
      clés unicode, $where, sécurité require/process/signature).

### 🔲 Reste à faire (à plus long terme)

- **Rate-limit `/data/api/*` : valide uniquement mono-instance** — le compteur est en mémoire
  (`Map` par process). **Aucune base Redis dans l'infra** (vérifié : pas de Redis dans les
  docker-compose ni la prod). Donc **on ne gère pas les replicas** : la documentation
  (`rateLimiter.js` + cette section) précise explicitement que le rate-limit n'est efficace
  qu'en mono-instance, et qu'un store partagé (Redis/DB) ne sera envisagé que si un Redis est
  ajouté à l'infra. *(Assumé et documenté.)*
- **Config engine/timer** : les `packages/engine/config.json` et `packages/timer/config.json`
  sont **vides dans ce repo**, mais en docker chaque service monte **`config.local.json`
  (racine) comme sa config** — c'est le même fichier copié dans tous les conteneurs. Les
  fichiers vides ne posent donc problème **qu'en exécution hors docker** (standalone) où
  `require('./config.json')` retournerait `{}`. Ne pas bloquant si on passe par docker.
- **Changement du mot de passe STOMP** : éditer `"password"` dans
  `rabbit/rabbitmq-definitions.json` (dev) et aligner l'env/config
  (`AMQP_STOMP_PASSWORD` / `amqpStompPassword`) + config prod, puis `make rabbit-reset`.
- **RabbitMQ `load_definitions`** : les définitions ne s'appliquent **qu'au premier démarrage**
  (base vide). Pour recharger sur un volume existant, utiliser **`make rabbit-reset`** (supprime
  le volume `rabbitmq_data` puis recrée le conteneur).
- **Coordination CVE/GHSA + re-audit externe** : publier l'advisory
  (`advisories/2026-08-semantic-bus-rce-eval.md`) **une fois tout prêt et déployé en prod**,
  créer le GHSA, demander une CVE, coordonner avec le chercheur.

---

## 5. État exact des tests (à jour)

- **Engine : 11 suites, 123 tests passent** (`cd packages/engine && npx jest`)
  (100 + 7 whereWorker + 6 validateExpression [crypto/proto-pollution/eval/Buffer] + 6 compat
  prod [eval/Buffer] + 4 sécurité runtime eval/require)
- **Core : 6 suites, 44 tests passent** (`cd packages/core && npx jest`)
  (11 initiaux + 6 hmac + 6 specificDataValidator + 6 hmac signMessage + 9 engineWorkAuth + 4 amqpUrl
  + **2 tests ObjectId HMAC**)
- **Timer : 1 suite, 17 tests passent** (`cd packages/timer && npx jest`)
- **Eval-service : 13 tests d'intégration passent** (`make test-eval`, container + cas réels prod)
- Lint : 0 erreur sur les fichiers modifiés/créés (warnings de style pré-existants).

---

## 6. État CI et points de vigilance pour la reprise ⚠️

### État des workflows GitHub (`.github/workflows/`)
- **`tests.yml`** : 5 jobs — `test-core`, `test-main`, `test-engine`, `test-timer`,
  **`test-eval-service`** (ajouté). Chaque job fait `cd packages/X && npm ci` puis `npm test`.
  Le job `test-eval-service` fait en plus `docker compose up -d --build eval-service` + attente
  health + `npx jest packages/eval-service/__tests__/eval-service.integration.test.js`.
- **`lint.yml`** : lint de core/main/engine (et auto-format). **N'inclut PAS eval-service.**
- **`security.yml`** : `npm audit --audit-level=critical` sur core/main/engine/timer
  (N'inclut PAS eval-service).

### ⚠️ Points CRITIQUES à vérifier avant de considérer la CI verte

1. **Le `package-lock.json` racine doit être COMMITÉ avec le workspace `eval-service`.**
   - Le `npm install --legacy-peer-deps` racine a régénéré le lockfile pour inclure
     `packages/eval-service`. Ce lockfile est **actuellement MODIFIÉ non commité**.
   - **Sans ce lockfile commité, `npm ci` dans `packages/eval-service` échouera en CI**
     ("lock file not up to date" / workspace introuvable).
   - ⚠️ Les autres packages (core/main/engine/timer) n'ont PAS de lockfile propre → ils utilisent
     le lockfile racine. Le `npm ci` par sous-package doit déjà fonctionner (pattern pré-existant).

2. **`npm ci` isolé dans un sous-package CASSE le node_modules partagé en local.**
   - Constat : après `cd packages/eval-service && npm ci`, `lokijs` (dép de l'engine) a disparu
     du node_modules racine → les tests engine échouaient au chargement (`Cannot find module
     'lokijs'`). Résolu par `npm install --legacy-peer-deps` racine.
   - **En CI, chaque job a son propre runner/checkout → pas de partage, donc PAS de problème.**
     Mais ⚠️ le job `test-eval-service` fait `npm ci` dans eval-service : il faut confirmer que
     ça installe bien les deps du workspace (core + jest) pour que le `npx jest` racine marche.

3. **Secret HMAC du eval-service — plus d'env, config.json montée.**
   - Le `eval-service` monte désormais `config.json` (`/data/packages/engine/config.json`)
     et son image expose un symlink `@semantic-bus/engine` → `getConfiguration`
     résout la config montée → `hmac_lib.secret()` = `config.secret`, identique à
     l'engine. **Plus aucune variable `ENGINE_HMAC_SECRET` / `.env` requise.**
   - En CI, `getConfiguration()` (core) échoue parfois (`Cannot find module
     '@semantic-bus/timer/config.json'`) → secret fallback `test-secret-for-testing`.
     Le job CI et `make test-eval` définissent donc `ENGINE_HMAC_SECRET=secret`
     **uniquement côté test** (signature du client de test), aligné sur le secret
     de dev. En prod, `test-eval` lit le secret depuis `config.json`.

4. **`npm test` en CI vs local.**
   - Les tests passent en local avec `npx jest --forceExit`. Le `npm test` (= `jest --detectOpenHandles`)
     peut timeout le shell **local** (worker "failed to exit gracefully"), mais **en CI headless
     ça se termine normalement** (warning non bloquant). À confirmer au premier run CI.

5. **`security.yml` — vulnérabilités critiques.**
   - Le `npm install` racine a signalé **3 vulnérabilités critiques** dans le workspace. Si elles
     concernent core/main/engine/timer, `security.yml` (qui bloque sur critical) **échouera**.
     ⚠️ C'est un risque pré-existant, mais à vérifier. (`npm audit` par package).

6. **`lint.yml`** — le lint des packages (core/main/engine) peut échouer si les fichiers modifiés
   ont des erreurs. Les erreurs de style (`no-async-promise-executor`, `semi`, indentation de
   `arraySplitByCondition`) sont **pré-existantes** mais `lint.yml` fait `npm run lint` → si ces
   erreurs sont déjà là sur la branche de base, elles étaient déjà en échec (à vérifier).

### Commandes utiles pour la reprise
```bash
# Tests unitaires (sans container)
cd packages/engine && npx jest --forceExit   # 123 tests
cd packages/core && npx jest                 # 42 tests
cd packages/timer && npx jest                # 17 tests

# Tests d'intégration du eval-service (nécessite le container)
cd /home/simon/GIT/Bus/Semantic-Bus
make test-eval                              # build + démarre container + 13 tests

# Si npm ci isolé a cassé node_modules :
npm install --legacy-peer-deps               # restaure tout le workspace
```

### État des services docker au moment de la reprise
- Le container `eval-service` a été construit et lancé via `docker compose up -d --force-recreate
  eval-service` (port 8083). Si absent, `make test-eval` le recrée.
- Le mot de passe STOMP `stomp-user` reste `change-me-stomp-password` (dev) — à renforcer en prod
  (définitions prod + config, puis `make rabbit-reset`).
