FROM node:12.8.0-alpine

USER root

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community' >> /etc/apk/repositories
RUN apk update

# dependencies
RUN apk add bash curl
RUN npm i -g truffle ganache-cli

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

# clone back-end
RUN mkdir -p /bulwark/app
ARG CACHEBUST=1
COPY . ./app
RUN npm i --prefix app

EXPOSE 5000

CMD [ "npm", "run", "bulwark:start", "--prefix", "app" ]