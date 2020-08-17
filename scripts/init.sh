#!/bin/bash -xe

if [[ $OSTYPE = linux* ]]
then
    lsof -i:8545
    if [ $? -ne 0 ]
    then
        echo "Ganache not up"
        npm run ganache &
    fi
    
    npm run database:clean

    if [ "$NODE_ENV" = production ]
    then npm run server:listen
    else npm run server:dev
    fi

else echo "use docker, thanks (:"; fi