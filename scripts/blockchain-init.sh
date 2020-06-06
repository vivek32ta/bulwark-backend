#!/bin/bash -xe

if [[ $OSTYPE =~ linux-gnu* ]]; then

    echo "Hello, Linux!"

    AccountAddr=$(awk "/\(0\)/,/\(9\)/" ./bulwark-data/ganache-output | head -10 | grep -o '0x.\{41\}' | head -1 | tr -d [:space:])
    sed -i'' "s/from: '0x.\{40\}'/from: '$AccountAddr'/g" initialize-chain.js

    ContractAddr=$(node initialize-chain.js | tail -1)
    sed -i'' "s/contract.options.address = \"0x.\{40\}\"/contract.options.address = \"$ContractAddr\"/g" routing/bulwark.js

    awk "/\(0\)/,/\(9\)/" ./bulwark-data/ganache-output > ./bulwark-data/address-and-keys
elif [[ $OSTYPE =~ darwin* ]]; then

    echo "Hello, Mac!"

    AccountAddr=$(awk "/\(0\)/,/\(9\)/" ./bulwark-data/ganache-output | head -10 | grep -o '0x.\{41\}' | head -1 | tr -d [:space:])
    sed -i '' "s/from: '0x.\{40\}'/from: '$AccountAddr'/g" initialize-chain.js

    ContractAddr=$(node initialize-chain.js | tail -1)
    sed -i '' "s/contract.options.address = \"0x.\{40\}\"/contract.options.address = \"$ContractAddr\"/g" routing/bulwark.js

    awk "/\(0\)/,/\(9\)/" ./bulwark-data/ganache-output > ./bulwark-data/address-and-keys
fi