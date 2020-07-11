#!/bin/bash -xe

if [[ $OSTYPE =~ linux* ]]
then
    echo "Hello, Linux!"

    AccountAddr=$(awk "/\(0\)/,/\(9\)/" ./bulwark-data/ganache-output | head -10 | grep -o '0x.\{41\}' | head -1 | tr -d [:space:])
    sed -i'' "s/from: '0x.\{40\}'/from: '$AccountAddr'/g" web3/initialize-chain.js

    ContractAddr=$(node web3/initialize-chain.js | tail -1)
    sed -i'' "s/contract.options.address = \"0x.\{40\}\"/contract.options.address = \"$ContractAddr\"/g" web3/bulwark-core.js

    awk "/\(0\)/,/\(9\)/" ./bulwark-data/ganache-output > ./bulwark-data/address-and-keys
    sed -i'' 's/(0)//g' bulwark-data/address-and-keys
else echo "use docker, thanks (:"; fi