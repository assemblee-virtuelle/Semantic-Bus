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


## Road map
- new ergonomy
- better sharing and options of sharing
  - group management
  - change admin
  - change role
  - credit consumption when workflow execution
    - timer owner
- authentified api calling (or pattern calling) and credit consumption fo caller
  - restrict api with authentificaiton
  - define how pay execution cause by API
- Big Data Support (Infinit data Volume)
  - we can do now it whith ticke ands external database as mongodb
- Automatic Ontology transformation (semantic web)
  - manual transformation now
- Authentification to external services
  - we use n8n or nocodeapi if we want to authentify to a data provider
- Multiple entry point and exit point for a components
  - entry discrimantaion have to be specified in component now
- Reusable and preconfigured pattern building from component
  - pattern can be implement now whith workflow trigger by api and body parameters but this could improve.
- Workflow sharing by Google Drive or other cloud or better wokflow management


## Archi

- Main ( ./main ) ( main app )
- Services
    - Timer (./timer) ( service for schedule workflow )
    - Core (./core) ( shared low level services )
    - Engine (./engine) ( motor for graph resolution )

## Launch with docker ( best solution )
* for mac we use docker-machine and not docker for mac in our configuration
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
* for mac we use docker-machine and not docker for mac in our configuration

For Mac
```bash
export CONFIG_URL="https://data-players.github.io/StrongBox/public/dev-mac.json"
&& docker-compose -f docker-compose.local.yaml up -d
```
For Linux
```bash
export CONFIG_URL="https://data-players.github.io/StrongBox/public/dev-linux.json" && docker-compose -f docker-compose.local.yaml up -d
```

## Launch with nvm & npm (Not recommended)

```bash
sudo apt-get install g++ build-essential
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
```

Restart console
```bash
nvm install 12.13
cd core && npm install
cd main && npm install
cd engine && npm install
cd main && node app.js
cd engine && node app.js

```
