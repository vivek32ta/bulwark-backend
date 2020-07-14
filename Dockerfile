FROM node:12.8.0-alpine

USER root

ARG NODE_ENV
ARG MONGO_URI
ARG OPEN_WEATHERMAP_ID
ARG METEO_STAT_API
ARG SECRET_KEY

ENV NODE_ENV=${NODE_ENV}
ENV MONGO_URI=${MONGO_URI}
ENV OPEN_WEATHERMAP_ID=${OPEN_WEATHERMAP_ID}
ENV METEO_STAT_API=${METEO_STAT_API}
ENV SECRET_KEY=${SECRET_KEY}

RUN mkdir -p /bulwark/$ENV
WORKDIR /bulwark/$ENV

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community' >> /etc/apk/repositories
RUN apk update

# dependencies
RUN apk add bash
RUN npm i -g truffle ganache-cli

# clone back-end
RUN mkdir -p /bulwark/app
ARG CACHEBUST=1
COPY . ./app
RUN npm i --prefix app

EXPOSE 5000

CMD [ "npm", "run", "bulwark:start", "--prefix", "app" ]