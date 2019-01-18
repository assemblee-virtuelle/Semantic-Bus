.DEFAULT_GOAL := help
.PHONY: docker-build docker-up start stop restart up-test-container launch-test

DOCKER_COMPOSE=docker-compose -f docker-compose.local.yaml


# Docker
docker-build:
	$(DOCKER_COMPOSE) build

docker-up:
	$(DOCKER_COMPOSE) up -d --remove-orphans semanticbus proxy rabbitmq mongodb

docker-stop:
	$(DOCKER_COMPOSE) kill
	$(DOCKER_COMPOSE) rm -fv

docker-clean:
	$(DOCKER_COMPOSE) kill
	$(DOCKER_COMPOSE) rm -fv

# Start

start: docker-up ## Start the project

stop: docker-stop ## Stop the project

restart: docker-clean docker-build docker-up ## Reinstall everything

test-start: 
	$(DOCKER_COMPOSE) up --remove-orphans  e2e