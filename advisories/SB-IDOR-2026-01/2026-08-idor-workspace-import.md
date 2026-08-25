# Advisory — Broken Access Control (IDOR) sur `POST /workspaces/:id/import` dans Semantic-Bus

> ⚠️ **Brouillon local de divulgation coordonnée.** L'identifiant GHSA / CVE sera
> assigné par GitHub / le CNA lors de la publication officielle. Documenter le contenu,
> la gravité et la chronologie. Ne pas publier avant la mise à disposition du correctif.

---

## Titre
Broken Access Control (IDOR) sur l'import de composants dans un workspace — exécution
de workflow cross-tenant.

## Résumé (Summary)
Semantic-Bus est une plateforme multi-tenant d'intégration de données (SaaS). La route
authentifiée `POST /workspaces/:id/import` permet d'importer des composants et des liens
dans un workspace, mais **omet la vérification d'autorisation par workspace**
(`wrapperSecurity` / owner-editor) que les routes sœurs appliquent. Tout utilisateur
authentifié bas-privilège peut écrire des composants (dont des expressions de
transformation / composants HTTP sortants) dans **n'importe quel workspace** (cross-tenant).

## Impact
- **Cross-tenant workflow tampering** : modification de composants de workflows d'autrui.
- **Exfiltration** : injection d'un composant HTTP sortant dans un workspace victime pour
  exfiltrer les données du flux.
- **DoS**.
- **Élargit la surface d'exploitation RCE** : permet à un attaquant de planter le payload
  RCE (autre advisory) dans le workspace d'une victime.

## Sévérité (Severity)
**Élevée (High)** — accès authentifié requis, impact cross-tenant.
CVSS à calculer (probablement ~8.x : réseau + authentifié faible + impact élevé).

## Versions affectées (Affected versions)
- Toutes les versions de Semantic-Bus antérieures au correctif sécurisé (branche concernée),
  au moins jusqu'à v0.11.2.

## Versions corrigées (Patched versions)
- **v0.11.3** (correctif IDOR + gestion admin en base) — PR sur master, release à venir.
- **v0.11.10 → v0.11.14** (confused deputy sur les routes sœurs, bigdataflow legacy, admin maintenance, IDOR fichiers/upload/componentId).
- **à venir (après v0.11.14)** : fail-open sur composants sans `workspaceId` (orphelins) — fail-closed + estampillage sur le chemin de création + backfill.

## Détails (Details)
- `POST /workspaces/:id/import` (`packages/main/server/workspaceWebService.js:244`) :
  **pas de `wrapperSecurity`** dans la chaîne middleware.
- Routes sœurs qui écrivent des composants : `POST /workspaces/:id/components` (:495),
  `PUT /workspaces/:id/components` (:387), `POST /workspaces/:id/components/connection` (:331) —
  toutes avec `wrapperSecurity`.
- Le handler utilise `req.params.id` sans vérification owner/editor : `getWorkspace`,
  `workspace_component_lib.create`, `addConnection`, `update`.
- La couche globale (`app.js`, `auth_lib.js`) ne vérifie que l'authentification JWT, pas
  l'autorisation par workspace.
- **Note** : `user_lib.js:240-242` traite tout utilisateur comme admin si `adminUsers` absent
  (config.json par défaut) — second problème à corriger.

## Correctif proposé
- ✅ **`wrapperSecurity` (owner/editor) ajouté à `POST /workspaces/:id/import`** —
  `packages/main/server/workspaceWebService.js:244` (même pattern que les routes sœurs,
  rôle `undefined` = owner OU editor, entité `workflow`).
- ✅ **`user_lib.js` corrigé** : ne plus traiter tout utilisateur comme admin si
  `adminUsers` absent (défaut moindre privilège) + garde contre `config` undefined
  (`packages/core/lib/user_lib.js:230-242`).
- ✅ **Bootstrap admin** : le premier utilisateur créé sur une instance vide devient
  `admin: true` (persisté en base) — un déploiement neuf reste exploitable sans
  configurer `adminUsers`. `adminUsers` configuré **prime** sur le statut persisté.
  (`user_lib.js:55-80` création, `:230-242` lecture) — `engineWorkAuth` respecte aussi
  ce statut persisté.
- ✅ **`GET /users` restreint aux admins** : middleware `wrapperAdmin` ajouté
  (`security.js`) — plus aucun utilisateur authentifié ne peut lister les users.
- ✅ **Gestion admin** : nouvel endpoint `PUT /users/:id/admin` (admin-only) pour
  promouvoir/dépromouvoir un user (`user_lib.updateAdmin`, `userWebservices.js:57`).
  Garde anti-lockout : un admin ne peut pas se dépromouvoir lui-même (400).
- ✅ **Interface admin** : écran `#admin` enrichi — liste des users + boutons
  « Promouvoir admin » / « Retirer admin » (`admin.tag`, `adminStore.js`).
- ✅ **Compatibilité partage** : `GET /users/emails` (authentifié JWT, emails seulement)
  créé pour l'autocomplétion du partage de workflow — `profilStore.js` basculé dessus.
  Le partage d'un non-admin ne casse plus.
- ℹ️ **`POST /workspaces/` (création)** : vérifié — pas un IDOR. La route crée un workspace
  dont l'appelant est l'owner (`workspace_lib.create(userIdBody, ...)`, owner dérivé du JWT) ;
  il n'y a pas de workspace cible cross-tenant à autoriser. Rien à ajouter.
- ⚠️ **Note opérationnelle** : sur une instance existante (utilisateurs déjà présents, sans
  `adminUsers` configuré), aucun utilisateur n'est admin par défaut — configurer `adminUsers`
  ou promouvoir via `PUT /users/:id/admin`.
- ✅ **Fail-open sur composants sans `workspaceId` (orphelins, contribution 3)** :
  `assertComponentInWorkspace` (`packages/core/lib/workspace_component_lib.js`) passait
  `if (component.workspaceId && ... !== workspaceId)` → fail-open : un utilisateur
  owner/editor pouvait écraser/supprimer un composant orphelin (le PUT estampait son propre
  `workspaceId`). Corrigé **fail-closed** (`!component.workspaceId || mismatch` → 403),
  associé à (1) l'estampillage de `workspaceId` sur le chemin embedded de
  `POST /workspaces/` (corrige aussi le bug latent de rattachement des composants) et
  (2) un **backfill** des orphelins existants (`packages/main/scripts/backfillOrphanComponents.js`)
  — les 3 à déployer ensemble, sinon les orphelins deviennent non éditables/destructibles.
  ⚠️ **Backfill = migration one-shot, plus nécessaire à partir de v0.11.16** (le fail-closed
  + l'estampillage empêchent la création de nouveaux orphelins) ; à exécuter une seule fois
  au déploiement de v0.11.16, idempotent.

## CWE
- **CWE-639** : Authorization Bypass Through User-Controlled Key (IDOR)
- **CWE-862** : Missing Authorization

## Crédit (Credit)
Signalée par **Maxim Yakovlev** (`batam111`) — divulgation coordonnée.

## Chronologie (Timeline / Disclosure)
| Date | Étape |
|---|---|
| 2026-08-20 | Réception du rapport par le chercheur |
| 2026-08-24 | Correctif développé + testé (wrapperSecurity sur import + user_lib admin défaut) |
| 2026-08-24 | Migration prod : admins `adminUsers` passés en base (`admin=true`), `adminUsers` retiré de config.json |
| (à compléter) | PR master + release v0.11.3 |
| (à compléter) | Publication |

## Références (References)
- `packages/main/server/workspaceWebService.js:244` (route import — wrapperSecurity ajouté)
- `packages/core/lib/user_lib.js:230-242` (défaut admin moindre privilège)
- `packages/main/server/services/security.js` (wrapperSecurity)
- `packages/core/lib/workspace_component_lib.js` (assertComponentInWorkspace fail-closed — contribution 3)
- `packages/main/server/workspaceWebService.js` (`POST /workspaces/` embedded — workspaceId estampé — contribution 3)
- `packages/main/scripts/backfillOrphanComponents.js` (backfill des orphelins — contribution 3)
- Tests : `packages/main/__tests__/server/workspaceSecurity.test.js`,
  `packages/core/__tests__/lib/workspace_component_security.test.js`
- À compléter : lien PR de correctif + release.
