FROM node:12.8.0-slim

USER root
RUN apt update

# dependencies
RUN apt install -y bash curl make python python3 g++

# npm dependencies
COPY package.json /tmp
RUN npm i --prefix /tmp
RUN npm i --quiet -g ganache-cli

# variables
ARG MAPQUEST_API
ARG METEO_STAT_API
ARG MONGO_URI
ARG NODE_ENV
ARG OPEN_WEATHERMAP_ID
ARG SECRET_KEY

ENV MAPQUEST_API=${MAPQUEST_API}
ENV METEO_STAT_API=${METEO_STAT_API}
ENV MONGO_URI=${MONGO_URI}
ENV NODE_ENV=${NODE_ENV}
ENV OPEN_WEATHERMAP_ID=${OPEN_WEATHERMAP_ID}
ENV SECRET_KEY=${SECRET_KEY}

RUN mkdir -p /bulwark/$NODE_ENV
WORKDIR /bulwark/$NODE_ENV

RUN apt install -y lsof
# clone back-end
RUN mkdir -p /bulwark/app
ARG CACHEBUST=1
COPY . ./app
RUN cp -a /tmp/node_modules ./app

EXPOSE 5000
CMD [ "npm", "run", "bulwark:start", "--prefix", "app" ]