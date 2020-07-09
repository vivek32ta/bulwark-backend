const Web3 = require('web3')
const fs = require("fs")

web3 = new Web3("http://localhost:8545")
web3.eth.getAccounts(console.log).then(f => account = f[0]);

const bytecode = fs.readFileSync(__dirname + "/../contracts/Insurance_sol_Insurance.bin").toString()
const abi      = JSON.parse(fs.readFileSync(__dirname + "/../contracts/Insurance_sol_Insurance.abi").toString())

deployedContract = new web3.eth.Contract(abi)

//Replace the address in from with one of your address...
//The chain owner will be that address.
deployedContract.deploy({
  data: bytecode
}).send({
  from: '0x3513c62d75e5b9E56A773B60A8B9D2793CD477e6',
  gas: 1500000,
  gasPrice: web3.utils.toWei('0.00003', 'ether')
}).then(newContractInstance => {
  deployedContract.options.address = newContractInstance.options.address
  console.log(newContractInstance.options.address);
})