# Security Policy

## Reporting a vulnerability

Si vous découvrez une vulnérabilité de sécurité dans Semantic-Bus, merci de la signaler
**en privé** plutôt que de l'exposer publiquement avant que le correctif ne soit disponible.

### Coordinated disclosure

Nous suivons un processus de **divulgation coordonnée** :
- Signalez la vulnérabilité de façon **privée** (voir contacts ci-dessous).
- Nous accuserons réception dans les plus brefs délais.
- Nous validerons et classifierons le rapport (gravité, périmètre, versions affectées).
- Nous développerons et testerons un correctif dans une branche dédiée.
- Nous coordonnerons la **date de publication** avec vous et vous créditerons si vous le
  souhaitez.
- En l'absence de correctif sous 90 jours, la publication pourra avoir lieu à J+90 conformément
  au principe de divulgation coordonnée.

### Contacts

- **Security advisory GitHub** : créez un *security advisory* privé sur le dépôt
  (onglet *Security → Advisories*), ou ouvrez un rapport privé via l'interface de signalement.
- **Email** : *(à renseigner — adresse de contact sécurité du mainteneur)*.

## Scope

Ce périmètre concerne le code du dépôt : `packages/engine`, `packages/main`, `packages/core`,
`packages/timer`, ainsi que la configuration et l'infrastructure décrites dans ce dépôt
(docker-compose, RabbitMQ, etc.).

Sont hors périmètre : les dépendances tierces (signaler via leur propre politique) et les
services hébergés par des tiers.

## Exemples de vulnérabilités pertinentes

- Exécution de code (RCE) via les `eval` / `new Function` de l'engine.
- Injection / évaluation non sécurisée dans les composants de transformation, filtrage, Mongo.
- Prototype pollution via les données injectées.
- ReDoS / déni de service via les expressions regex ou `$where`.
- Accès non autorisé aux endpoints d'exécution (authentification / autorisation).

## Reporting security advisories

Les divulgations coordonnées sont documentées dans `advisories/`. La politique de sécurité est
détaillée dans `specifications/security-eval-and-code-execution.md`.
