# Advisory — Remote Code Execution (RCE) via `eval` de l'engine Semantic-Bus

> ⚠️ **Brouillon local de divulgation coordonnée.** L'identifiant GHSA / CVE sera
> assigné par GitHub / le CNA lors de la publication officielle de l'advisory.
> Ce fichier documente le contenu, la gravité et la chronologie proposée pour le
> GitHub Security Advisory. Ne pas publier avant la mise à disposition du correctif.

---

## Titre
Remote Code Execution (RCE) dans le moteur d'exécution de Semantic-Bus via l'évaluation
non sécurisée de code JavaScript (`eval`) dans les composants de transformation/filtrage.

## Résumé (Summary)
Semantic-Bus est une plateforme multi-tenant d'intégration de données (SaaS). Le moteur
(`packages/engine`) évalue du JavaScript fourni par les utilisateurs dans plusieurs
composants (transformation `= expr`, filtre `$where`, évaluation JS, tri, etc.). Avant
correction, ces évaluations étaient effectuées par `eval(...)` **sans validation statique**
ni isolation, dans le process principal du moteur. Un utilisateur authentifié (ou un
attaquant pouvant déclencher l'exécution d'un composant, y compris via des endpoints
sans authentification) pouvait exécuter du code arbitraire sur le serveur.

## Impact
Exécution de code arbitraire dans le contexte du process Node de l'engine, avec accès à
l'environnement d'exécution (MongoDB, Scylla, RabbitMQ, volume `./uploads`, secrets du
`config.json`). Gravité maximale dans un déploiement multi-tenant public.

## Sévérité (Severity)
**Critique**
CVSS 3.1 : **9.8**
Vecteur : `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`
(Unauthenticated network attack possible via les endpoints d'exécution sans authentification.)

## Versions affectées (Affected versions)
- Toutes les versions de Semantic-Bus antérieures au correctif sécurisé (branche
  `security/remove-sift-and-secure-eval`), à partir de la première version exposant le
  moteur d'évaluation `eval` (V2).

## Versions corrigées (Patched versions)
- Version à définir lors de la release du correctif (correctif porté sur la branche
  `security/remove-sift-and-secure-eval`, à merger dans `production`).

## Détails (Details)
Le process engine (`packages/engine`) évalue du JavaScript écrit par l'utilisateur dans
plusieurs composants :

- `utils/objectTransformationV2.js` — transformations `= expr` (jsEvaluation, objectTransformer, sort, queryParamsCreation) ;
- `workspaceComponentExecutor/filter.js` et `arraySplitByCondition.js` — conditions `$where` ;
- `workspaceComponentExecutor/MongoDB.js` — requêtes Mongo (`eval('collection.' + ...)`) ;
- `workspaceComponentExecutor/regex.js` — motifs regex appliqués aux données.

Avant correction, ces `eval` étaient exécutés **sans validation statique du contenu**, et
certains sinks pouvaient être atteints **sans authentification** :

- `POST /engine/work-ask/:componentId` (routeur `unsafe`) ;
- `/data/api/*` (composant httpProvider, routeur `unSafeRouteur`).

Un attaquant pouvait injecter du code JavaScript arbitraire (accès à `process`, `require`,
`fs`, modules natifs, etc.) via le `specificData` des composants ou les données interpolées
dans les chaînes évaluées → RCE complète.

### Correctif appliqué
1. **`validateExpression`** : validation statique AST (acorn) de toute expression AVANT son
   `eval` — interdiction des identifiants système/natifs (`process`, `require`, `fs`, ...),
   des propriétés d'évasion (`constructor`, `__proto__`, `prototype`, ...), des structures de
   code (boucles, fonctions, ...) et des fonctions lodash de proto-pollution.
2. **`evalSecurity.sanitizeValue`** : assainissement des données injectées (retrait des
   getters et des clés dangereuses).
3. **`worker_threads` terminables** : les `eval` de transformation, les regex et les
   conditions `$where` sont exécutés dans des workers terminables avec timeout (isolation +
   protection DoS/ReDoS).
4. **`mongoQueryExecutor`** : suppression de l'`eval` Mongo au profit d'une grammaire stricte.
5. **Suppression du moteur de transformation V1** (`objectTransformation.js`) mort et du
   code `sift` (RCE via `new Function`).
6. **Authentification des points d'exécution** : signature HMAC sur `POST /engine/work-ask/:componentId`,
   validation JWT + autorisation sur la file AMQP `work-ask`, rate-limit sur `/data/api/*`.
7. **Validation `specificData` à l'écriture** des composants.

## CWE
- **CWE-94** : Improper Control of Generation of Code ('Code Injection')
- **CWE-95** : Improper Neutralization of Directives in Dynamically Evaluated Code ('Eval Injection')
- **CWE-1336** : Improper Neutralization of Special Elements Used in a Template Engine

## Contournement (Workaround)
En attendant la release corrigée : désactiver/ne pas exposer les endpoints d'exécution sans
authentification, et restreindre l'accès réseau aux services internes (RabbitMQ, engine).

## Crédit (Credit)
Vulnérabilité signalée par **Maxim Yakovlev** (divulgation coordonnée).

## Références (References)
- Branche de correctif : `security/remove-sift-and-secure-eval`
- Spec technique : `specifications/security-eval-and-code-execution.md`
- (À compléter) lien vers le commit de correctif et la release corrigée.

## Chronologie (Timeline / Disclosure)
| Date | Étape |
|---|---|
| (à compléter) | Réception et accusé de réception du rapport par le chercheur |
| (à compléter) | Confirmation de l'exploitabilité, du périmètre et de la gravité |
| (à compléter) | Développement et test du correctif (branche dédiée) |
| (à compléter) | Mise à disposition de la release corrigée |
| (à compléter) | Publication de l'advisory (après fix, ≤ 90 jours) |

> **Note de coordination** : le correctif est prêt dans cette branche. Avant publication,
> coordonner avec le chercheur (crédit, date de publication), finaliser la release corrigée,
> puis créer le GitHub Security Advisory (GHSA) et demander une CVE.

---

## Annexe — Bonnes pratiques suivies (source : recherche Perplexity)
- **Nom de fichier local** : descriptif (`advisories/SB-RCE-2026-01/2026-08-semantic-bus-rce-eval.md`),
  **pas** le GHSA/CVE ID (ceux-ci sont assignés par GitHub/CNA lors de la publication).
- **`SECURITY.md`** : politique de signalement du dépôt (séparée de l'advisory).
- **Publication** : après la disponibilité du correctif ; au plus tard à J+90 en divulgation
  coordonnée ; coordonner la date et le crédit avec le chercheur avant publication.
