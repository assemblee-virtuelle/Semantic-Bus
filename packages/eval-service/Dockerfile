FROM node:20-alpine

WORKDIR /data/eval-service

RUN node -v && npm -v

# libs nécessaires à l'évaluation (dayjs, cheerio, etc.) peuvent nécessiter des
# outils de compilation
RUN apk add --update --no-cache python3 py3-pip make g++ bash

# Structure workspace : package.json racine + core + eval-service
COPY package.json /data/
RUN mkdir -p /data/packages/eval-service /data/packages/core

COPY packages/eval-service/package.json /data/packages/eval-service/
COPY packages/core/package.json /data/packages/core/

# Installer les dépendances du workspace (core fournit hmac_lib)
RUN cd /data/ && npm install --legacy-peer-deps

# Copier le code du eval-service + le core (hmac_lib)
COPY packages/eval-service /data/packages/eval-service/
COPY packages/core /data/packages/core/

WORKDIR /data/packages/eval-service

EXPOSE 8083

CMD ["node", "app.js"]
