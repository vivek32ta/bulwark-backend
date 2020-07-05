Web3 = require('web3')
fs = require("fs")

web3 = new Web3("http://localhost:8545")
web3.eth.getAccounts(console.log).then((f)=>{account=f[0]});

bytecode = fs.readFileSync(__dirname+"/contracts/Insurance_sol_Insurance.bin").toString()
abi = JSON.parse(fs.readFileSync(__dirname+"/contracts/Insurance_sol_Insurance.abi").toString())

deployedContract = new web3.eth.Contract(abi)

//Replace the address in from with one of your address...
//The chain owner will be that address.
deployedContract.deploy({
  data: bytecode
}).send({
<<<<<<< Updated upstream
  from: '0x82725f83e2e568cBF62c0AbBe885F6EE0B11c6f6',
=======
  from: '0xF0D753612E636ccd42F0837A8d6BF58b0a3A332a',
>>>>>>> Stashed changes
  gas: 1500000,
  gasPrice: web3.utils.toWei('0.00003', 'ether')
}).then((newContractInstance) => {
  deployedContract.options.address = newContractInstance.options.address
  console.log(newContractInstance.options.address);
});

