# set the base image to Debian
# https://hub.docker.com/_/debian/
FROM debian:latest

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# define app folder
WORKDIR /data/engine

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get install -y build-essential \
    && apt-get install -y ca-certificates \
    && apt-get install -y git \
    && apt-get install -y python \
    && apt-get -y autoclean


# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 8.9.0

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
ENV PATH /data/node_modules/.bin:$PATH


# confirm installation
RUN node -v
RUN npm -v

RUN npm install pm2 -g
RUN npm install nodemon -g
# Bundle app source

ARG CONFIG_URL

ENV CONFIG_URL=$CONFIG_URL

ARG ENV 
RUN if [ "$ENV" == "production" ]; \
    then  export PM2_PUBLIC_KEY=rgstoan52posxx6 && export PM2_SECRET_KEY=93al1u17774txzu; \
    else  export PM2_PUBLIC_KEY=""; \
    fi 

RUN echo "FORCE_INSPECTOR=1" >> /etc/environment
RUN source /etc/environment
RUN pm2 reload app --update-env

ADD ./core /data/core/
ADD ./engine /data/engine/
ADD ./engine/package.json /data/
ADD ./wait-for-it.sh /data/scripts/

RUN cd /data && npm cache clean --force && npm install

EXPOSE 8080

CMD [ "pm2-runtime", "app.js" ]


