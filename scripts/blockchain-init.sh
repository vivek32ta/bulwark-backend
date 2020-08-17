#!/bin/bash -xe

if [[ $OSTYPE =~ linux* ]]
then

    echo "Hello, Linux!"

    lsof -i:8545
    while [ $? -ne 0 ]
    do sleep 1 && lsof -i:8545; done

    ContractAddrPath='web3/contract.address'
    node web3/initialize-chain.js

    if [ $? -ne 0 ]; then echo "Something went wrong." && exit 1; fi
    if [ ! -f $ContractAddrPath ]; then echo "Contract address not found." && exit 1; fi

    AccountAddr=$(cat web3/addresses | head -1)
    ContractAddr=$(cat $ContractAddrPath)
    sed -i'' "s/contract.options.address = \"0x.\{40\}\"/contract.options.address = \"$ContractAddr\"/g" web3/bulwark-core.js

    echo "Depositing 50ETH to contract address"
    res=000
    while [ "$res" = 000 ]
    do sleep 1 && res=$(curl -X GET http://localhost:5000/dev/deposit/50/$AccountAddr -w "%{http_code}"); done

    sed -i'' 1d web3/addresses
    echo "Everything's set up"

else echo "use docker, thanks (:"; fi