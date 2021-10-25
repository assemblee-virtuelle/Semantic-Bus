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

- Data completion from linked field (semantic web)
- Automatic Ontology transformation (semantic web)
- OAuth Support throw API
- Support new record mention to propagate information across multiple neighbour node (see web mention)
- Big Data Support (Infinit data Volume)
- Multiple entry point and exit point for a components
- Reusable and preconfigured pattern building from component
- R Component
- Workflow sharing by Google Drive

## Archi

- Main ( ./main ) ( main app )
- Services
    - Timer (./timer) ( service for schedule workflow )
    - Core (./core) ( shared low level services )
    - Engine (./engine) ( motor for graph resolution )



## Install

- `ssh-keygen -t rsa`
- Add the generated public key (`.ssh/id_rsa.pub`) in Github admin

See https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/


### Git
```bash
git clone git@github.com:assemblee-virtuelle/Semantic-Bus.git
```

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
