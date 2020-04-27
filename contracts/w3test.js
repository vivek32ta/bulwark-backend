Web3 = require('web3')
fs = require("fs")

web3 = new Web3("http://localhost:8545")
web3.eth.getAccounts(console.log).then((f)=>{account=f[0]});

bytecode = fs.readFileSync("Insurance_sol_CarInsurance.bin").toString()
abi = JSON.parse(fs.readFileSync("Insurance_sol_CarInsurance.abi").toString())

deployedContract = new web3.eth.Contract(abi)


deployedContract.deploy({
  data: bytecode
}).send({
  from: '0xd6e49312708aD5DaEF3f78115f5D646F6702F4F2',
  gas: 1500000,
  gasPrice: web3.utils.toWei('0.00003', 'ether')
}).then((newContractInstance) => {
  deployedContract.options.address = newContractInstance.options.address
  console.log(newContractInstance.options.address);
});

