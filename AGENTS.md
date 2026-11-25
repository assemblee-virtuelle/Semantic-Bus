# Semantic-Bus Development Agent Guidelines

> Guide for AI development agents working on the Semantic-Bus codebase

---

## 📖 Documentation

Before making any changes, consult the specifications directory:

| Document | Description |
|----------|-------------|
| [specifications/architecture.md](./specifications/architecture.md) | System architecture, packages, databases, messaging |
| [specifications/development-guide.md](./specifications/development-guide.md) | Code standards, conventions, common tasks, testing |
| [specifications/components-catalog.md](./specifications/components-catalog.md) | Complete catalog of workflow components |
| [specifications/configuration.md](./specifications/configuration.md) | Configuration options reference |

---

## 🎯 Quick Start

1. **Read the architecture** to understand the monorepo structure
2. **Follow the development guide** for code conventions and workflows
3. **Check the components catalog** when working on components
4. **Review configuration** for environment setup

---

## ✨ Development Best Practices

### File Management

- **DO NOT create intermediate report or analysis files** unless explicitly requested by the user
- Examples of files to avoid creating automatically:
  - Analysis reports (`.md`, `.txt`)
  - Summary documents
  - Debug logs or trace files
  - Temporary documentation files
- If analysis is needed, provide it directly in the chat response
- Only create such files when the user explicitly asks for them

---

## 🖥️ Validation UI avant merge (Playwright)

> **Règle** : toute feature/modif touchant l'**interface** (client/static) doit être
> **validée localement par un test E2E Playwright AVANT de merger la PR**.

### Prérequis (une fois)

- Démarrer l'infra locale : `docker compose -f docker-compose.yaml up -d rabbitmq mongodb scylla main`
- Le container `main` monte `./packages/main` et `./packages/core` en volume → les
  changements front sont servis sans rebuild.
- Créer un user admin en base (ou réutiliser un compte admin existant).

### Exécuter la validation

```bash
node tests/e2e/admin-users-render.js          # écran admin (liste users + tri)
```

Variables d'env optionnelles : `BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASS`, `CHROMIUM_PATH`.

### Critères de sortie

Le script échoue (exit 1) si : le tag ne monte pas, la liste est vide, le header est
incomplet, ou une erreur console survient. **Ne merger la PR que si le test passe.**

### Arrêter l'infra

```bash
docker compose -f docker-compose.yaml kill && docker compose -f docker-compose.yaml rm -fv
```

---

## 🚀 Production Deployment (référence historique)

To deploy changes to production, follow these steps:

1. **Commit changes on master branch**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

2. **Push master branch**
   ```bash
   git push origin master
   ```

3. **Switch to production branch**
   ```bash
   git checkout production
   ```

4. **Commit on production branch**
   ```bash
   git merge master
   git commit -m "Deploy to production"
   ```

5. **Push production branch**
   ```bash
   git push origin production
   ```

6. **Switch back to master branch**
   ```bash
   git checkout master
   ```
