#!/bin/bash -xe

mkdir -p bulwark-data

if [[ $OSTYPE = "linux"* || $OSTYPE = "darwin"* ]]
then
    mongod &
    if [ "$NODE_ENV" = production ]
    then concurrently "npm run blockchain:start" "npm run database:clean && npm run server:listen"
    else concurrently "npm run blockchain:start" "npm run database:clean && npm run server:startdev"; fi
else echo "Please run it manually."; fi
