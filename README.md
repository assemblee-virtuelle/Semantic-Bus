# SemanticBus

[![license](https://img.shields.io/github/license/assemblee-virtuelle/Semantic-Bus.svg)](https://github.com/assemblee-virtuelle/Semantic-Bus)
[![GitHub issues](https://img.shields.io/github/issues/assemblee-virtuelle/Semantic-Bus.svg)](https://github.com/assemblee-virtuelle/Semantic-Bus/issues)
[![GitHub forks](https://img.shields.io/github/forks/assemblee-virtuelle/Semantic-Bus.svg)](https://github.com/assemblee-virtuelle/Semantic-Bus/network)
[![GitHub stars](https://img.shields.io/github/stars/assemblee-virtuelle/Semantic-Bus.svg)](https://github.com/assemblee-virtuelle/Semantic-Bus/stargazers)

## ETL style data middleware transformation embedded in an ESB for all kinds of data

Semantic Bus is a new generation of API management software. It treats data as a flow, which makes it easy to transform on the fly, extract and merge data from multiple sources.

Transform with ease any kind of data : Excel files, CSV files, JSON, XML, TTL (Turtle), Images, even Emails and many more !

Use Semantic Bus to build reactive architectures (event-sourcing), and easily develop decentralized and autonomous applications.

It can automatically analyze unstructured data and extract objects so that you can use them in a semantic way.

SematinBus handles millions of objects and thousands of endpoints in production.

Don't build integration web services manually. Describe them, and SematicBus will auto-generate.

## Online live demo

A live demo is available at [tour.semapps.org](http://tour.semapps.org)

## docker / docker-compose install

### Quick start

For a demo environment use

```
make demo
```

For a development environment use 

```
make develop
```

A sample config config.local.json is available at the root and will start basic service. 

Complete doc about docker is here in the repo : [Docker README](DOCKER.md)

## Development / Local installation

### Required dependencies

- Node.js (v16+)
- Git
- MongoDB (v4+)
- RabbitMQ (v3.8+)

### clone this repo

```
git clone https://github.com/assemblee-virtuelle/Semantic-Bus
cd Semantic-Bus
```

then install the three packages 

```
cd engine && npm install
cd ../main && npm install
cd ../timer && npm install
```

### Launch

Start MongoDB instance (on Linux)

```
sudo systemctl start mongod
```

Start RabbitMQ instance (on Linux)

```
sudo systemctl start rabbitmq-server
```

start the main module 

```
cd main && node app.js
```

and the main engine in another shell 

```
cd engine && node app.js
```

and optionally the timer 

```
cd timer && node app.js
```

Check if everything is working as expected visiting [http://localhost:8080](http://localhost:8080)

## Documentation

For a complete documentation of the project, see the [documentation site](https://doc.semapps.org) (in french) and the [quick tutorial](https://github.com/assemblee-virtuelle/Semantic-Bus/blob/master/TUTORIAL.md).

## Contributing

Please check out our [contributing guidelines](CONTRIBUTING.md).

## Architecture

SemanticBus is based on a multi-module architecture with independent testing and deployment.

---

*Tests CI/CD powered by GitHub Actions* ✅

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
