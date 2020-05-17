#!/bin/bash -xe

if [[ $OSTYPE = "linux-gnu"* || $OSTYPE = "darwin"* ]]
then concurrently "npm run blockchain:start" "npm run database:clean && npm run server:start"
else echo "Please run it manually."; fi
