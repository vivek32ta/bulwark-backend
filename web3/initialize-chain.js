
(async () => {
  const fs = require('fs')
  const {getAccounts, deployContract, web3} = require('./bulwark-core')

  getAccounts()
    .then(res => {
      fs.writeFileSync(__dirname + '/addresses', res.slice(1).join('\n'))
      return deployContract(res[7])
    })
    .then(contractAddress => {
      fs.writeFileSync(__dirname + '/contract.address', contractAddress.options.address)
    })
    .catch(err => console.log(err))
})()