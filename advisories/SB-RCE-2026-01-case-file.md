# Vulnerability Case File — RCE via `eval` dans le composant Filter de Semantic-Bus

> **Case file / dossier de suivi organisationnel et administratif** de la divulgation coordonnée.
> Document unique qui suit le cycle complet du cas (réception → validation → correctif → divulgation → post-divulgation).
> Toutes les dates sont en **UTC**. Statut courant : `fixing` (correctif déployé, validation en cours).
> L'advisory technique (GHSA/CVE draft) est dans `advisories/2026-08-semantic-bus-rce-eval.md`.

---

## 00-meta

| Champ | Valeur |
|---|---|
| **Case ID** | `SB-RCE-2026-01` |
| **Projet / repo** | Semantic-Bus — `assemblee-virtuelle/Semantic-Bus` (repo dev : `/home/simon/GIT/Bus/Semantic-Bus`) |
| **Type de vulnérabilité** | Remote Code Execution (RCE) — CWE-94 / CWE-95 / CWE-1336 |
| **Chercheur (reporter)** | Maxim Yakovlev — `<ilmaxyakovlev@gmail.com>` (cc Alexandre) |
| **Mainteneur / owner du cas** | Simon Louvet — `<simon.louvet.pro@gmail.com>` |
| **Incident lead** | Simon Louvet |
| **Date de début** | 2026-08-12 (réception de l'email) |
| **Date cible de divulgation** | Réception + 90 jours (≈ 2026-11-10) — divulgation coordonnée |
| **Statut** | `fixing` (correctif développé + déployé en prod, validation utilisateur en cours) |
| **Lien advisory** | `advisories/2026-08-semantic-bus-rce-eval.md` |
| **Branche de correctif** | `security/remove-sift-and-secure-eval` |

---

## 01-intake (réception)

### Événements

- **2026-08-12** : réception de l'email du chercheur Maxim Yakovlev
  - Objet : *"Security: authenticated RCE in Semantic-Bus Filter component — requesting a secure channel"*
  - Il demande un **canal sécurisé** pour le rapport complet + PoC (repli : réponse email, advisory privé GitHub, clé GPG, autre).
  - Il demande si on veut **coordonner une CVE via un GitHub Security Advisory** ou gérer nous-mêmes.
  - Il suit une **divulgation coordonnée de 90 jours** et propose d'aider à vérifier le correctif.

### Résumé du rapport (niveau haut, sans payload)

- Un composant Filter de workflow avec un `filterString` / `specificData` stocké est exécuté quand le workflow tourne.
- Deux sinks d'exécution de code dans `packages/engine/workspaceComponentExecutor/filter.js` :
  1. **sift** `$where` (compile en `new Function(...)`) ;
  2. un **`eval(...)` brut**.
- Un attaquant qui peut créer/modifier un composant Filter d'un workspace exécute du JS arbitraire dans le process Node de l'engine à la prochaine exécution.

### Modèle d'attaque (tel que décrit par le chercheur)

- `POST /workspaces/` exige un JWT valide → **pas anonyme**.
- MAIS : manque le contrôle `wrapperSecurity` par ressource que les autres routes `/workspaces/:id/...` ont → **tout utilisateur authentifié** (ex. un "editor" bas privilège) peut l'atteindre.
- Même classe que les récents sift issues : Mongoose (CVE-2024-53900), Taskcluster (CVE-2026-11892).
- sift est `^17.1.3` **sans mode CSP** ; le sink `eval()` n'a **aucune garde**.

### Checklist intake

- [x] Accuser réception rapidement (2026-08-12, email reçu)
- [x] Confirmer un canal sécurisé pour le rapport complet + PoC
- [x] Demander au chercheur de ne pas divulguer publiquement avant la coordination
- [x] Confirmer le périmètre et les versions affectées
- [x] Conserver le texte original du rapport + pièces jointes (email archivé : `~/Téléchargements/Security_ authenticated RCE in Semantic-Bus Filter component — requesting a secure channel.eml`)
- [x] Noter que le rapport est sous embargo (timeline 90 jours)

---

## 02-triage-validation (tri / validation)

### Événements

- **2026-08-13 → 2026-08-19** : tri interne, validation du périmètre, développement du correctif (voir §04).

### Résultat

- **Exploitabilité : confirmée** (sans payload, démonstration du principe).
- **Composants affectés** : `packages/engine` (moteur d'évaluation), tous les composants qui évaluent du JS utilisateur :
  - `objectTransformationV2.js` (transformations `= expr` : jsEvaluation, objectTransformer, sort, queryParamsCreation) ;
  - `filter.js` / `arraySplitByCondition.js` (conditions `$where`) ;
  - `MongoDB.js` (requêtes Mongo via `eval('collection.'+...)`) ;
  - `regex.js` (motifs regex).
- **Versions affectées** : toutes les versions de Semantic-Bus antérieures au correctif sécurisé, à partir de la première version exposant le moteur d'évaluation `eval` (V2).
- **Endpoints d'exécution sans authentification aggravants** : `POST /engine/work-ask/:componentId` et `/data/api/*` (httpProvider).
- **Prérequis** : un utilisateur authentifié pouvant créer/modifier un composant Filter (rôle `editor` inclus).

### Pièces / preuves

- Rapport email du chercheur (archivé localement).
- Analyse technique complète : `specifications/security-eval-and-code-execution.md`.

---

## 03-severity-cvss (gravité)

| Champ | Valeur |
|---|---|
| **Sévérité** | Critique |
| **CVSS 3.1** | **9.8** |
| **Vecteur** | `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| **Impact** | Exécution de code arbitraire dans le process Node de l'engine : accès MongoDB, Scylla, RabbitMQ, volume `./uploads`, secrets du `config.json`. |
| **Prérequis** | JWT valide (tout utilisateur inscrit / éditeur). Vecteur réseau possible via les endpoints d'exécution. |
| **CWE** | CWE-94 (Code Injection), CWE-95 (Eval Injection), CWE-1336 (Template Engine) |

> Note : la sévérité est **préliminaire** ; à re-confirmer lors de la rédaction officielle du GHSA/CVE.

---

## 04-remediation (correctif)

### Événements

- **2026-08-13 → 2026-08-19** : développement du correctif sur la branche `security/remove-sift-and-secure-eval`.
- **2026-08-19** : correctif déployé en production et **validé fonctionnellement par l'utilisateur** sur les flux (transform, filter $where, joinByField, unicity, regex, jsEvaluation, mongo).

### Mesures appliquées (résumé)

1. **Retrait de `sift`** (RCE via `new Function`) → filtres natifs.
2. **Validation statique AST** (`validateExpression`, acorn) avant tout `eval` — deny-list des identifiants système/natifs + propriétés d'évasion, whitelist `new`, interdit structures de code, interdit fonctions lodash de proto-pollution.
3. **Sanitisation des données injectées** (`evalSecurity.sanitizeValue` : retrait getters + clés dangereuses `__proto__`/`constructor`/`prototype`).
4. **Isolation** : les évals (transform, $where, regex) tournent dans un **eval-service container** + worker_threads terminables (timeout) → plus de `eval` dans le process principal.
5. **`mongoQueryExecutor`** : suppression de l'`eval` Mongo → grammaire stricte.
6. **Auth des points d'exécution** : signature HMAC sur `POST /engine/work-ask/:componentId`, validation JWT + autorisation sur la file AMQP `work-ask`, rate-limit IP sur `/data/api/*`.
7. **Validation `specificData` à l'écriture** des composants.
8. **Suppression du moteur de transformation V1 mort** (`objectTransformation.js`).

### Commits (référence)

Voir `git log production..HEAD` sur la branche `security/remove-sift-and-secure-eval`.

### Tests

- **Engine** : 11 suites, 131 tests.
- **Core** : 6 suites, 50 tests (incl. hmac signBuffer/verifyBuffer).
- **Eval-service** : 10 tests unitaires pool + 15 tests d'intégration.
- **Compatibilité prod** : 8 604/8 604 composants compatibles (`specifications/compatibility-matrix-prod.md`).
- **Tests de sécurité runtime** : `eval("require('fs')...")` → échoue ; `eval("process.env")` → échoue.

### Checklist remediation

- [x] Branche de correctif privée : `security/remove-sift-and-secure-eval`
- [x] Owner du fix : Simon Louvet
- [x] Changements par commit (documentés dans le git log)
- [x] Tests de sécurité ajoutés
- [x] Tests de non-régression ajoutés (toutes suites vertes)
- [x] Build/test matrix OK
- [x] Le fix ferme le chemin d'exploitation (validé fonctionnellement en prod)
- [x] Chemins de code vulnérables liés vérifiés (audit des sinks, cf. spec §3)
- [ ] Backports : **à décider** selon les versions supportées

---

## 05-coordinated-disclosure (divulgation coordonnée)

### Timeline (à compléter au fil de l'eau)

| Date (UTC) | Étape |
|---|---|
| 2026-08-12 | Réception + accusé de réception du rapport par le chercheur |
| 2026-08-12 → 2026-08-13 | Confirmation du canal sécurisé + réception des détails/PoC (canal : à finaliser) |
| 2026-08-13 → 2026-08-19 | Validation de l'exploitabilité, du périmètre et de la gravité |
| 2026-08-13 → 2026-08-19 | Développement + test du correctif (branche dédiée) |
| 2026-08-19 | Correctif déployé en prod + validé fonctionnellement |
| 2026-08-19 → | (à faire) Mise à disposition de la **release corrigée** (merge + tag) |
| → 2026-11-10 (J+90) | Publication de l'advisory (après fix, ≤ 90 jours) |

### Checklist coordinated-disclosure

- [x] Date cible de divulgation fixée (J+90 ≈ 2026-11-10)
- [x] Dates jalons suivies (ci-dessus)
- [ ] Notifier le chercheur des progrès (à faire : une fois la release prête)
- [ ] Enregistrer tout accord d'embargo / délai de release
- [ ] Suivre les dépendances sur les downstream packagers/maintainers

---

## 06-ghsa-cve (avis GitHub + CVE)

### Checklist

- [ ] Créer le **brouillon GitHub Security Advisory** (GHSA) — sur `assemblee-virtuelle/Semantic-Bus`
- [ ] Renseigner : résumé, impact, versions affectées, versions corrigées, workarounds, références
- [ ] Lier les commits et la release
- [ ] Ajouter le score/vecteur CVSS
- [ ] **Demander une CVE** (via le workflow GHSA, ou CNA)
- [ ] Enregistrer l'ID CVE pré-assigné ou demandé
- [ ] Enregistrer l'ID GHSA et le statut de publication

> **Décision à prendre avec le chercheur** : coordonner la CVE via un GHSA (préféré) ou gérer nous-mêmes. Le chercheur a explicitement proposé les deux options dans son email.

---

## 07-public-release (release corrigée)

### Checklist

- [ ] Préparer les notes de release (CHANGELOG.md)
- [ ] **Merger** `security/remove-sift-and-secure-eval` → `production`
- [ ] Tagger la version corrigée (version à définir)
- [ ] Publier release + advisory ensemble (ou dans un ordre contrôlé)
- [ ] Annoncer sur les canaux du projet
- [ ] S'assurer que le fix est inclus dans toutes les branches supportées
- [ ] Archiver les artefacts de release
- [ ] Vérifier que l'advisory public reflète les bonnes versions affectées/corrigées

---

## 08-post-disclosure (post-divulgation)

### Checklist

- [ ] Confirmer que l'advisory et la page de release sont publiques
- [ ] Notifier le chercheur de la publication
- [ ] **Créditer le chercheur** (attribution préférée à confirmer avec lui)
- [ ] Vérifier les index de paquets, miroirs et avis downstream
- [ ] Re-vérifier les versions vulnérables restantes
- [ ] Surveiller le tracker d'issues pour les rapports de suivi
- [ ] Confirmer que l'enregistrement CVE est mis à jour / lié

---

## 09-lessons-learned (retour d'expérience)

> À compléter après la publication. Rétrospective courte.

### À documenter

- **Cause racine** : évaluation de code JS non validée/non isolée dans le process principal de l'engine, combinée à des endpoints d'exécution sans authentification.
- **Ce qui a retardé le tri / le fix** :
- **Détection / tests à ajouter** (qui auraient attrapé cette classe de bug) :
- **Mise à jour des pratiques de développement sécurisé** :
- **Mise à jour de la politique de divulgation / playbook maintainer** :
- **Tests unitaires/intégration** à ajouter pour cette classe de bug :
- **Tâches de suivi** (owner + échéance) :

---

## Annexe — Artefacts

| Artefact | Emplacement |
|---|---|
| Email original du chercheur | `~/Téléchargements/Security_ authenticated RCE in Semantic-Bus Filter component — requesting a secure channel.eml` |
| Advisory technique (draft GHSA/CVE) | `advisories/2026-08-semantic-bus-rce-eval.md` |
| Politique de signalement | `SECURITY.md` |
| Spec technique de sécurisation | `specifications/security-eval-and-code-execution.md` |
| Matrice de compatibilité prod | `specifications/compatibility-matrix-prod.md` |
| Branche de correctif | `security/remove-sift-and-secure-eval` |

---

## Bonnes pratiques suivies (source : recherche Perplexity)

- **Un seul fichier de cas** ("vulnerability case file") avec un owner clair, une timeline datée, et des sections séparées (intake, analyse, fix, divulgation, postmortem). [4][6][11]
- **Canal de communication sécurisé** et accord d'embargo avant tout échange de PoC.
- **GHSA draft = source de vérité** pour les métadonnées publiques de vulnérabilité ; la CVE est demandée via le workflow GHSA. [6][12][3]
- **Publication après le correctif** : l'advisory est publié une fois le patch disponible, pour alerter la communauté après remédiation. [2][3][6]
- **Crédit au chercheur** avec attribution préférée à confirmer.
- **Une seule timeline canonique**, toutes les dates en UTC, statut suivi (new/validated/fixing/embargoed/ready/published/closed).
- **Garder le fichier privé** jusqu'à la publication s'il contient des détails d'exploitation (ici, pas de PoC en clair).
