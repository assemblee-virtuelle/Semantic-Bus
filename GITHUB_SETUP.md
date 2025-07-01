# Configuration GitHub pour Semantic Bus Engine

## 🚀 Outils GitHub Utilisés

Cette configuration remplace CircleCI par une solution 100% GitHub :

### ✅ GitHub Actions
- **CI/CD Pipeline** - Tests automatisés et déploiement
- **Multi-environnements** - Staging et Production
- **Sécurité intégrée** - CodeQL et Trivy

### ✅ GitHub Packages
- **Container Registry** - Stockage des images Docker
- **Gestion des versions** - Tags automatiques

### ✅ GitHub Security
- **Dependabot** - Mises à jour automatiques des dépendances
- **Code Scanning** - Analyse de sécurité du code
- **Secret Scanning** - Détection de secrets

### ✅ GitHub Environments
- **Protection des branches** - Règles de déploiement
- **Approbations manuelles** - Contrôle des déploiements

## 📋 Configuration Requise

### 1. Activation des Fonctionnalités

Dans **Settings > General** :
- ✅ Issues
- ✅ Pull Requests  
- ✅ Actions
- ✅ Packages
- ✅ Environments

Dans **Settings > Security** :
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Dependabot version updates
- ✅ Code scanning alerts
- ✅ Secret scanning alerts

### 2. Protection des Branches

#### Branche `main` (Production)
```
Settings > Branches > Add rule

Branch name pattern: main

Protect matching branches:
✅ Require a pull request before merging
  ✅ Require approvals (2)
  ✅ Dismiss stale reviews
  ✅ Require review from CODEOWNERS
✅ Require status checks to pass before merging
  ✅ Require branches to be up to date
  Required status checks:
    - Tests Unitaires (ubuntu-latest, 18.x)
    - Tests Unitaires (ubuntu-latest, 20.x)
    - Tests d'Intégration
    - Analyse de Sécurité
    - Contrôle Qualité
✅ Require signed commits
✅ Include administrators
✅ Restrict pushes that create files larger than 100MB
```

#### Branche `develop` (Staging)
```
Branch name pattern: develop

Protect matching branches:
✅ Require a pull request before merging
  ✅ Require approvals (1)
✅ Require status checks to pass before merging
  Required status checks:
    - Tests Unitaires
    - Contrôle Qualité
```

### 3. Environnements

#### Staging Environment
```
Settings > Environments > New environment

Name: staging
Protection rules:
- No protection rules (déploiement automatique)

Environment secrets:
- STAGING_API_URL
- STAGING_DATABASE_URL
- STAGING_RABBITMQ_URL
```

#### Production Environment
```
Name: production
Protection rules:
✅ Required reviewers: @your-team/maintainers
✅ Wait timer: 5 minutes
✅ Deployment branches: main only

Environment secrets:
- PRODUCTION_API_URL
- PRODUCTION_DATABASE_URL
- PRODUCTION_RABBITMQ_URL
```

### 4. Secrets Repository

```
Settings > Secrets and variables > Actions

Repository secrets:
- CODECOV_TOKEN (pour la couverture de code)
- SLACK_WEBHOOK (notifications optionnelles)
- TEAMS_WEBHOOK (notifications optionnelles)

Repository variables:
- NODE_VERSION: "20.x"
- DOCKER_REGISTRY: "ghcr.io"
```

### 5. Teams et Permissions

Créer les équipes suivantes :

```
@your-team/semantic-bus-maintainers
  - Admin access
  - Can merge to main
  - Required for production deployments

@your-team/engine-team
  - Write access
  - Code owners for /engine/

@your-team/qa-team
  - Write access  
  - Code owners for /tests/

@your-team/devops-team
  - Write access
  - Code owners for /.github/workflows/
```

## 🔄 Workflows Configurés

### 1. Tests (`tests.yml`)
**Déclencheurs :**
- Push sur `main` et `develop`
- Pull Requests vers `main` et `develop`
- Déclenchement manuel

**Jobs :**
- Tests unitaires (Node 18.x et 20.x)
- Tests d'intégration (avec MongoDB et RabbitMQ)
- Tests Docker
- Analyse de sécurité (CodeQL)
- Contrôle qualité (ESLint, Prettier)

### 2. Déploiement (`deploy.yml`)
**Déclencheurs :**
- Push sur `main` (production)
- Tags `v*` (releases)
- Déclenchement manuel

**Jobs :**
- Build et push des images Docker
- Déploiement staging (automatique)
- Déploiement production (avec approbation)
- Scan de sécurité des images
- Notifications

## 📊 Monitoring et Observabilité

### GitHub Insights
- **Actions** - Historique des builds
- **Security** - Alertes de sécurité
- **Insights** - Métriques du repository

### Badges README
Ajoutez ces badges à votre README.md :

```markdown
[![Tests](https://github.com/your-org/semantic-bus-engine/actions/workflows/tests.yml/badge.svg)](https://github.com/your-org/semantic-bus-engine/actions/workflows/tests.yml)
[![Deploy](https://github.com/your-org/semantic-bus-engine/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-org/semantic-bus-engine/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/your-org/semantic-bus-engine/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/semantic-bus-engine)
[![Security](https://github.com/your-org/semantic-bus-engine/actions/workflows/security.yml/badge.svg)](https://github.com/your-org/semantic-bus-engine/security)
```

## 🔧 Commandes Utiles

### Déclencher un Workflow Manuellement
```bash
# Via GitHub CLI
gh workflow run tests.yml

# Déploiement avec paramètres
gh workflow run deploy.yml -f environment=staging
```

### Voir les Logs d'Exécution
```bash
# Lister les exécutions
gh run list

# Voir les logs d'une exécution
gh run view RUN_ID --log
```

### Gestion des Secrets
```bash
# Ajouter un secret
gh secret set SECRET_NAME --body "secret-value"

# Lister les secrets
gh secret list
```

## 🚨 Troubleshooting

### Échec des Tests
1. Vérifier les logs dans l'onglet Actions
2. Reproduire localement avec `npm test`
3. Vérifier les dépendances et versions Node.js

### Échec du Déploiement
1. Vérifier les permissions sur l'environnement
2. Contrôler les secrets d'environnement
3. Valider les images Docker

### Problèmes de Sécurité
1. Consulter l'onglet Security
2. Traiter les alertes Dependabot
3. Réviser les résultats CodeQL

## 📈 Métriques de Qualité

### Objectifs
- ✅ **Couverture de code** : > 80%
- ✅ **Temps de build** : < 10 minutes
- ✅ **Temps de déploiement** : < 5 minutes
- ✅ **Taux de réussite** : > 95%

### Monitoring
- **Actions Dashboard** - Vue d'ensemble des workflows
- **Dependency Graph** - Visualisation des dépendances
- **Security Advisories** - Alertes de sécurité

## 🎯 Avantages vs CircleCI

### ✅ Avantages GitHub
- **Intégration native** - Pas de configuration externe
- **Coût** - Inclus avec GitHub
- **Sécurité** - Outils intégrés
- **Simplicité** - Un seul outil
- **Packages** - Registry intégré

### 📊 Comparaison des Fonctionnalités

| Fonctionnalité | GitHub Actions | CircleCI |
|----------------|----------------|----------|
| CI/CD Pipeline | ✅ | ✅ |
| Multi-environnements | ✅ | ✅ |
| Container Registry | ✅ (inclus) | ❌ (externe) |
| Analyse de sécurité | ✅ (inclus) | ❌ (externe) |
| Gestion dépendances | ✅ (Dependabot) | ❌ (externe) |
| Coût | ✅ (inclus) | 💰 (payant) |
| Configuration | ✅ (simple) | ⚠️ (complexe) |

---

**Configuration complète GitHub Actions prête à l'emploi !** 🚀