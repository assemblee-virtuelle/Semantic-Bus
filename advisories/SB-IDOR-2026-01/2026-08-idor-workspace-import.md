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
- À définir lors de la release du correctif.

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
- Appliquer `wrapperSecurity` (owner/editor) à `POST /workspaces/:id/import`.
- Vérifier/ajouter `wrapperSecurity` à `POST /workspaces/` (création).
- Corriger `user_lib.js` : ne pas traiter tout utilisateur comme admin si `adminUsers` absent.

## CWE
- **CWE-639** : Authorization Bypass Through User-Controlled Key (IDOR)
- **CWE-862** : Missing Authorization

## Crédit (Credit)
Signalée par **Maxim Yakovlev** (`batam111`) — divulgation coordonnée.

## Chronologie (Timeline / Disclosure)
| Date | Étape |
|---|---|
| 2026-08-20 | Réception du rapport par le chercheur |
| (à compléter) | Confirmation / correctif |
| (à compléter) | Publication |

## Références (References)
- `packages/main/server/workspaceWebService.js:244` (route import sans wrapperSecurity)
- `packages/main/server/services/security.js` (wrapperSecurity)
- À compléter : lien PR de correctif + release.
