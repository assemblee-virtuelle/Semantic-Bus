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

## 🚀 Production Deployment

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
