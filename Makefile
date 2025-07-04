.DEFAULT_GOAL := help
.PHONY: docker-build docker-up build start log stop restart

DOCKER_COMPOSE=docker-compose -f docker-compose.yaml
DOCKER_COMPOSE_TEST=docker-compose -f docker-compose.test.yaml


# Docker
docker-build:
	$(DOCKER_COMPOSE) build

docker-up:
	$(DOCKER_COMPOSE) up -d --remove-orphans amqp mongo

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
