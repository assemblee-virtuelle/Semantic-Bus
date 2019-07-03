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

#### Option 1

```bash
git clone git@github.com:assemblee-virtuelle/Semantic-Bus.git
```


### nvm & npm

```bash
sudo apt-get install g++ build-essential
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

# Restart console

nvm install 8.9
cd core && npm install
cd main && npm install
cd engine && npm install

```


## Launch with docker ( best solution ) *
* for mac we use docker-machine and not docker for mac in our configuration
### Docker

```bash
( DOCKER-COMPOSE REQUIRED )

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

### Docker for Mac specific instructions

Start by cloning the repository from github, using a fresh copy of Semantic Bus is recommended.

#### Configure and build

After Docker for Mac launched, run following commands in your terminal:

```bash
# This is on purpose to use linux version
export CONFIG_URL="https://data-players.github.io/StrongBox/public/dev-linux.json"

# Pull the necessary images from docker hub
docker pull semanticbus/rabbitmq-stomp mongo debian

# Building local images
docker build . -t semanticbus/main -f main/Dockerfile
docker build . -t semanticbus/timer -f timer/Dockerfile
docker build . -t semanticbus/engine -f engine/Dockerfile
```

#### Run, watch and stop

To run Semantic Bus, execute `docker-compose -f docker-compose.devWithTimerForMac.yaml up -d` in your terminal.

To watch, run `docker-compose -f docker-compose.devWithTimerForMac.yaml logs -f`. Use `^c` (Ctrl-c) to stop watching.

Finally, to stop and remove the containers, run `docker-compose -f docker-compose.devWithTimerForMac.yaml down`.

You can navigate to http://localhost:8080 and should be granted with a request to login.

### Application In Local ( Not recommended)
* for mac we use docker-machine and not docker for mac in our configuration
```bash
For Mac
export CONFIG_URL="https://data-players.github.io/StrongBox/public/dev-mac.json"
&& docker-compose -f docker-compose.local.yaml up -d
For Linux
export CONFIG_URL="https://data-players.github.io/StrongBox/public/dev-linux.json" && docker-compose -f docker-compose.local.yaml up -d

cd main && node app.js
cd engine && node app.js

```
