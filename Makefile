.DEFAULT_GOAL := help
.PHONY: docker-build docker-up build start log stop restart \
        rabbit-up rabbit-reset \
        eval-up test-eval \
        backfill-orphans

DOCKER_COMPOSE=docker compose -f docker-compose.yaml
DOCKER_COMPOSE_TEST=docker compose -f docker-compose.test.yaml


# Docker
docker-build:
	$(DOCKER_COMPOSE) build

docker-up:
	$(DOCKER_COMPOSE) up -d --remove-orphans rabbitmq mongo

docker-stop:
	$(DOCKER_COMPOSE) kill
	$(DOCKER_COMPOSE) rm -fv

docker-clean:
	$(DOCKER_COMPOSE) kill
	$(DOCKER_COMPOSE) rm -fv

docker-restart:
	$(DOCKER_COMPOSE) up -d --force-recreate

log:
	$(DOCKER_COMPOSE) logs -f engine main timer

# RabbitMQ
rabbit-up:
	$(DOCKER_COMPOSE) up -d --force-recreate rabbitmq

# Reconstruit RabbitMQ proprement : recharge les définitions (users/vhosts/queues)
# au premier démarrage. Supprime le volume de données puis recrée le conteneur.
rabbit-reset:
	$(DOCKER_COMPOSE) stop rabbitmq || true
	$(DOCKER_COMPOSE) rm -fv rabbitmq || true
	docker volume ls -q | grep rabbitmq_data | xargs -r docker volume rm -f
	$(DOCKER_COMPOSE) up -d --force-recreate rabbitmq

# Eval-service (container d'évaluation isolé)
eval-up:
	$(DOCKER_COMPOSE) up -d --force-recreate eval-service

# Tests d'intégration du eval-service (cas réels de production).
# Démarre le container si nécessaire, attend sa disponibilité, puis exécute les
# tests via HTTP signé (HMAC).
test-eval:
	$(DOCKER_COMPOSE) up -d --force-recreate eval-service
	@echo "⏳ Attente du eval-service (health)..."
	@for i in $$(seq 1 30); do \
	  if curl -sf http://localhost:8083/health >/dev/null 2>&1; then echo "✅ eval-service prêt"; break; fi; \
	  sleep 2; \
	done
	EVAL_SERVICE_URL=http://localhost:8083 ENGINE_HMAC_SECRET=${ENGINE_HMAC_SECRET:-secret} npx jest packages/eval-service/__tests__/eval-service.integration.test.js

# Backfill des composants sans workspaceId (orphelins) — SB-IDOR-2026-01.
# MIGRATION ONE-SHOT : plus nécessaire à partir de v0.11.16 (le fail-closed +
# l'estampillage workspaceId sur POST /workspaces/ empêchent les nouveaux orphelins).
# À exécuter une seule fois, au déploiement du code fail-closed, sinon les composants
# orphelins existants deviennent non éditables/destructibles par personne (même leur
# propriétaire). Idempotent — inutile de le relancer sur une instance déjà ≥ v0.11.16.
# Lance le script dans le container main (config.local.json monté → base locale).
backfill-orphans:
	@docker compose ps --status running main >/dev/null 2>&1 || { echo "❌ Container main non démarré — démarrer d'abord (make up / docker-up)"; exit 1; }
	@docker compose exec -T main node -e "require('/data/packages/main/scripts/backfillOrphanComponents').work()"

# Start
start: docker-restart

stop: docker-stop

restart: docker-restart

build: docker-build

test-build:
	$(DOCKER_COMPOSE_TEST) build --no-cache

test-start:
	$(DOCKER_COMPOSE_TEST) run e2e bash -c "sleep 10 && curl -f http://semanticbus:80 || exit 1"
	$(DOCKER_COMPOSE_TEST) run e2e xvfb-run -a codeceptjs run --grep @local --steps
