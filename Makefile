.DEFAULT_GOAL := help
.PHONY: docker-build docker-up build start log stop restart test test-unit test-integration test-coverage

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

# Tests
test-unit:
	cd tests/test_unitaires && npm test

test-unit-watch:
	cd tests/test_unitaires && npm run test:watch

test-unit-coverage:
	cd tests/test_unitaires && npm run test:coverage

test-engine:
	cd tests/test_unitaires && npm run test:engine

test-utils:
	cd tests/test_unitaires && npm run test:utils

test-services:
	cd tests/test_unitaires && npm run test:services

test-integration:
	$(DOCKER_COMPOSE_TEST) run e2e bash ./wait-for-it.sh semanticbus:80 -t 45
	$(DOCKER_COMPOSE_TEST) run e2e xvfb-run -a codeceptjs run --grep @local --steps

test-build:
	$(DOCKER_COMPOSE_TEST) build --no-cache

test-start:
	$(DOCKER_COMPOSE_TEST) run e2e bash ./wait-for-it.sh semanticbus:80 -t 45
	$(DOCKER_COMPOSE_TEST) run e2e xvfb-run -a codeceptjs run --grep @local --steps

test: test-unit

# Help
help:
	@echo "Available commands:"
	@echo "  build           - Build Docker containers"
	@echo "  start           - Start the application"
	@echo "  stop            - Stop the application"
	@echo "  restart         - Restart the application"
	@echo "  log             - Show application logs"
	@echo "  test            - Run all unit tests"
	@echo "  test-unit       - Run unit tests"
	@echo "  test-unit-watch - Run unit tests in watch mode"
	@echo "  test-coverage   - Run unit tests with coverage"
	@echo "  test-engine     - Run engine tests only"
	@echo "  test-utils      - Run utils tests only"
	@echo "  test-services   - Run services tests only"
	@echo "  test-integration- Run integration tests"
