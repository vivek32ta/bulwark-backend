
ethers = require("ethers");
fs = require("fs")

bytecode = fs.readFileSync("Insurance_sol_CarInsurance.bin").toString()
abi = JSON.parse(fs.readFileSync("Insurance_sol_CarInsurance.abi").toString())

provider = new ethers.providers.JsonRpcProvider();

provider.listAccounts().then(result => console.log(result))

signer = provider.getSigner(0)
factory = new ethers.ContractFactory(abi, bytecode, signer)

contract = null

factory.deploy().then(c=>{contract=c;console.log("Contract Created");console.log(contract.address)})


contract.underwrite({value:1e17}).then((f)=>{console.log(f)})


