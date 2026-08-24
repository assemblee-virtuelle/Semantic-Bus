---
name: advisory
description: Gestion homogène des advisory de sécurité Semantic-Bus — format des documents (advisory technique, case file, correspondance), process de bout en bout (réception → tri → correctif → GHSA/CVE → publication) et checklist de résolution codage. À utiliser pour toute nouvelle faille signalée, toute mise à jour d'advisory, ou toute préparation de session de codage.
---

# Advisory Semantic-Bus — Format, Process et Résolution

> Skill de référence pour la gestion homogène des advisory de sécurité de Semantic-Bus.
> À utiliser pour : créer une nouvelle advisory, mettre à jour une advisory existante,
> préparer une session de codage de correctif, ou suivre une faille jusqu'à la publication.

---

## 1. Structure des répertoires (standard)

Chaque faille distincte a son propre répertoire sous `advisories/`. Convention de nommage :

```
advisories/
└── <ID-FAIL>/                      # ex. SB-RCE-2026-01, SB-IDOR-2026-01
    ├── <AAAAMM>-<slug>.md          # ADVISORY TECHNIQUE (tracké git, contenu publié)
    ├── <ID-FAIL>-case-file.md      # CASE FILE / suivi organisationnel (IGNORÉ git)
    └── correspondance/             # messages du chercheur, preuves (IGNORÉ git)
        └── <AAAAMM>-<slug>.md
```

**Conventions de nommage des IDs** : `SB-<TYPE>-<AAAA>-<NN>` où TYPE ∈ {RCE, IDOR, XSS, SSRF, ...}.

**Règles `.gitignore`** (déjà en place dans `.gitignore`) :
```
advisories/*/*-case-file.md       # case file interne, non publié
advisories/*/correspondance/      # correspondance chercheur, non publiée
```
L'**advisory technique** (`<AAAAMM>-<slug>.md`) est le SEUL fichier tracké git (contenu destiné à la publication).

---

## 2. Les 3 types de documents

### 2.1 Advisory technique (`<AAAAMM>-<slug>.md`) — TRACKÉ, publié

Contenu qui sera publié (GHSA/CVE). Template :
```markdown
# Advisory — <Titre>

> ⚠️ **Brouillon local de divulgation coordonnée.** GHSA/CVE assigné par GitHub/CNA
> à la publication. Ne pas publier avant la mise à disposition du correctif.

## Titre
## Résumé (Summary)
## Impact
## Sévérité (Severity)   # CVSS vector + score + vecteur
## Versions affectées (Affected versions)
## Versions corrigées (Patched versions)
## Détails (Details)     # fichiers:lignes, chaîne d'attaque
## Correctif proposé
## CWE                    # ex. CWE-94, CWE-639, ...
## Crédit (Credit)
## Chronologie (Timeline)
## Références (References)  # PR correctif, release, SECURITY.md
```

### 2.2 Case file (`<ID>-case-file.md`) — IGNORÉ git, interne

Suivi organisationnel complet (basé sur les bonnes pratiques de l'industrie) :
```markdown
# Vulnerability Case File — <Titre>
> ⚠️ Document INTERNE — non public. Outil de suivi, ignoré par git.

## 00-meta          # Case ID, repo, type, reporter, owner, dates, statut
## 01-intake        # réception, canal sécurisé, embargo, modèle d'attaque
## 02-triage-validation
## 03-severity-cvss
## 04-remediation   # correctif, commits, tests
## 04-bis           # (pour chaque faille/baypass supplémentaire dans le même cas)
## 05-coordinated-disclosure  # timeline UTC, checklist
## 06-ghsa-cve      # GHSA ID, CVE, statut
## 07-public-release
## 08-post-disclosure
## 09-lessons-learned
## Réponse au chercheur (brouillons de mails)
## Annexe — Artefacts
## Bonnes pratiques (recherche Perplexity)
```

### 2.3 Correspondance (`correspondance/`) — IGNORÉ git, interne

Messages du chercheur reproduits intégralement + analyse + correctif + brouillon de réponse.

---

## 3. Process de bout en bout (réception → publication)

Statuts possibles du case file : `new` → `validated` → `fixing` → `embargoed` → `ready` → `published` → `closed`.

| Étape | Actions |
|---|---|
| **Réception** | Reproduire le message dans `correspondance/`, créer l'advisory technique + case file, accuser réception, confirmer canal sécurisé (GHSA privé / GPG / paste chiffré), noter timeline |
| **Tri/validation** | Reproduire la faille en environnement sûr, confirmer fichiers:lignes, gravité, CVSS |
| **Correctif** | Développer le correctif (voir §4), tests de sécurité + non-régression, PR → master → production, release |
| **GHSA/CVE** | Créer le GHSA draft, renseigner summary/severity/CWE/versions/credits, ajouter le chercheur si compte GitHub, demander la CVE au moment de la publication |
| **Publication** | Après correctif déployé + coordination chercheur, ≤ J+90. Créditer, vérifier advisory publique |
| **Post-publication** | Monitorer, lessons-learned, fermer le cas |

**Disclosure timeline** : J+90 depuis la réception (divulgation coordonnée). Publier APRÈS le correctif, en coordination avec le chercheur.

---

## 4. Résolution — Checklist de codage d'un correctif

Quand on corrige une faille (session de codage), suivre cette checklist standard :

1. **Reproduire d'abord** : écrire un test/PoC qui reproduit la faille AVANT le correctif.
2. **Identifier la cause racine** (pas juste le symptôme) et le périmètre réel (toutes les routes/sinks concernés, pas seulement celui signalé).
3. **Appliquer le correctif** : modifier le(s) fichier(s) concernés, en suivant les patterns de sécurité existants.
4. **Ajouter des tests de sécurité** : le PoC doit être bloqué APRÈS le correctif.
5. **Vérifier les cas prod** : s'assurer que les fonctionnalités légitimes continuent de fonctionner (matrice de compatibilité).
6. **Toutes les suites** : core, main, engine, timer, eval-service (unitaires + intégration + pool).
7. **Vérifier l'audit** : `npm audit --audit-level=critical` exit=0 sur tous les packages.
8. **CI verte** : tests + lint + security.
9. **PR** vers `master` → sync `production` → release + tag.
10. **Mettre à jour le GHSA** (version corrigée, description, références).

**Pattern de déploiement** : merge sur `master` (via PR) → migration sur `production` (PR fast-forward) → `make deploy` sur le serveur.

---

## 5. Vérifications sécurité transverses (à appliquer à toute faille d'éval)

Les vulnérabilités d'évaluation de code JS doivent être vérifiées contre toutes ces couches
(voir le cas SB-RCE-2026-01) :
- `validateExpression` : identifiants interdits (`process`, `require`, `constructor`...),
  whitelist par lib (`LIB_METHOD_WHITELISTS`), pas d'appels nus.
- Scope eval (`secureContext.js`) : whitelist des fonctions exposées, pas de compileur
  host-realm, wrappers minimaux pour Buffer/crypto/he.
- `importModuleDynamically` : rejette `import()` dans le contexte vm.
- `stripDangerousGlobals` : retire `process`/`require`/`module`/`global`/`console`/`fetch`/`WebSocket`.
- Vecteurs natifs Node : `constructor`/`prototype`/`__proto__` bloqués.
- Retour au comportement Loki : évaluation atomique par item, boucle côté appelant.
