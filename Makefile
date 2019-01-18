.DEFAULT_GOAL := help
.PHONY: docker-build docker-up start stop restart up-test-container launch-test

DOCKER_COMPOSE=docker-compose -f docker-compose.local.yaml
DOCKER_COMPOSE_TEST=docker-compose -f docker-compose.test.yaml


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
 	docker stop $(docker ps -aq)
    docker rm $(docker ps -aq)
    docker network prune -f
    docker rmi -f $(docker images --filter dangling=true -qa)
    docker volume rm $(docker volume ls --filter dangling=true -q)
    docker rmi -f $(docker images -qa)
	$(DOCKER_COMPOSE_TEST) build --no-cache
	$(DOCKER_COMPOSE_TEST) down -v --remove-orphans
	$(DOCKER_COMPOSE_TEST) down -v --remove-orphans
	$(DOCKER_COMPOSE_TEST) up --force-recreate