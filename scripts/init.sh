#!/bin/bash -xe

mkdir -p bulwark-data

if [[ $OSTYPE = linux* ]]
then
    if [ "$NODE_ENV" = production ]
    then concurrently "npm run blockchain:start" "npm run database:clean && npm run server:listen"
    else concurrently "npm run blockchain:start" "npm run database:clean && npm run server:dev"; fi
else echo "use docker, thanks (:"; fi