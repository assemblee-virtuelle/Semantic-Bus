#!/bin/sh
# Entrypoint RabbitMQ — active les plugins nécessaires puis démarre le serveur.
# Monté en volume dans le conteneur (pas d'image customisée).

set -e

# Activer les plugins STOMP + management (idempotent, persiste via le volume de données)
rabbitmq-plugins enable --offline rabbitmq_management rabbitmq_stomp rabbitmq_web_stomp || true

# Démarrer RabbitMQ (délègue au script de démarrage officiel de l'image).
# L'override de l'entrypoint ne transmet pas la CMD image : on rétablit le
# défaut `rabbitmq-server` si aucun argument n'est fourni.
if [ "$#" -eq 0 ]; then
  set -- rabbitmq-server
fi
exec docker-entrypoint.sh "$@"
