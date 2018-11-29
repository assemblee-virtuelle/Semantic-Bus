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


## Install

- `ssh-keygen -t rsa`
- Add the generated public key (`.ssh/id_rsa.pub`) in Github admin

See https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/


### Git

#### Option 1

```bash
git clone --recursive git@github.com:assemblee-virtuelle/Semantic-Bus.git
```


#### Option 2

```bash
git clone git@github.com:assemblee-virtuelle/Semantic-Bus.git
git submodule init
git submodule update
```


### nvm & npm

```bash
sudo apt-get install g++ build-essential
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

# Restart console

nvm install 7.10
npm install
```


## Launch

### Docker

```bash
docker-compose up
```


### Application

```bash
node app.js
```