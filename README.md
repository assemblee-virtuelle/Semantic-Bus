# Semantic-Bus

Semantic data transformation & semantic container crawling


## Features

- Ready for 100 MO / 100000 Item per process
- Multiple source protocol
- Multiple destination protocol
- Rich API creation
- Data transformation without coding
- Value correspondence (translation between taxonomy)
- Join data by field
- Data aggregation from multiple source
- Complex uniqueness
- Geo data completion from address
- Middle cache database for performance
- Scrapping & crawling
- Filter
- Workflow sharing & multi User Edition
- API parameters usable in workflow components

## need tiers
- Big Data Support (Infinit data Volume)
  - we can do now it with external database as mongodb and advances workflows
- Authentification to external services other than api tocken (headers or url)
  - we use n8n or nocodeapi if we want to authentify to a data provider

## Road map
- Reusable and preconfigured pattern building from component
  - pattern can be implement now whith workflow trigger by api and body parameters but this could improve.
  - it is now possible using api and call it from an other workflow. Better usability and component have to improve experience and performance.
- define how pay execution cause by internal API (http provider call by a http consumer of an other workflow)
- HTTP provider external authentificaiton and restriciton
  - authentified api calling
    - secure api provided by http provider component when calling out of SemanticBus Instance
  - api user restriction
    - define who ca execute HTTP provider
- better sharing and options of sharing
  - group management
  - change admin
  - change role
- new ergonomy
- Automatic Ontology transformation (semantic web)
  - manual transformation now
- Multiple entry point and exit point for a components
  - entry discrimantaion have to be specified in component now
- Workflow sharing by Google Drive or other cloud or better wokflow management


## Archi

- Core (./core) ( shared low level services )
- Main ( ./main ) ( main app : frontend and API)
- Engine (./engine) ( engine for graph resolution )
- Timer (./timer) ( service for schedule workflow )

## Config
You have to duplicate config.js to local.config.js.
Some config properties as googleAuth can be fullfill.
Your local.config.js file will be ignore by git.

## Launch with docker (recommended)
### make (recommended)

( DOCKER-COMPOSE REQUIRED )
```bash
make start => start project
make log => log main and engine container
make restart => force recreate
make stop => kill all container

```
docker container still alive sometime:
```
docker kill semanticbus_mongo_1
docker kill rabbitmq
```

### docker-compose (Not recommended)

docker-compose up -d

## Launch with nvm & npm (Not recommended)

```bash
sudo apt-get install g++ build-essential
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
```

Restart console
```bash
nvm install 18
cd core && npm install
cd main && npm install
cd engine && npm install
cd main && node app.js
cd engine && node app.js

```

---
*Tests CI/CD powered by GitHub Actions* ✅
