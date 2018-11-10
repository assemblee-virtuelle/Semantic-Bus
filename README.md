# Semantic-Bus
semantic data transformation &amp; semantic container crawling

## features
- Ready for 100 MO / 100000 Item per process
- Multiple source protocole
- Multiple destination protocole
- Rich API creation
- Data transformation without coding
- Value correspondence (translation between taxonomy)
- Join data by field
- Data agregation from multiple source
- Complex unicity
- Geo data completion from address
- Middle cache database for performance
- Srapping & crawling
- Filter
- Workfow sharing & multi User Edition
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

## install

- `ssh-keygen -t rsa`
- ajouter la clef publique généré (.ssh/id_rsa.pub) dans l'admin de github

### GIT
#### option 1

- `git clone --recursive git@github.com:assemblee-virtuelle/Semantic-Bus.git`

#### option 2

- `git clone git@github.com:assemblee-virtuelle/Semantic-Bus.git`
- `git submodule init`
- `git submodule update`

### nvm & npm

- `sudo apt-get install g++ build-essential`
- `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash`
- redemarer console
- `nvm install 7.10`
- `npm install`

### launhing
#### one time
- `npm run amqpPull`
#### each reboot
- `npm run amqpRun`
- `npm run mongoRun`
- if amqp or mongo ever run, you can reboot them
- 'npm run amqpStop'
- 'npm run mongoStop'
#### each time
- `node start`
