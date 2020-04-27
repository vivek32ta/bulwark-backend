Web3 = require('web3');
fs = require("fs");
const amount = 1e17;
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
abi = JSON.parse(fs.readFileSync("Insurance_sol_CarInsurance.abi").toString())
contract = new web3.eth.Contract(abi)

//Update the contract address here.
contract.options.address = "0xf855a4D69cf05Cd4806ba4c83ED2C772E49a967C";

var account;
web3.eth.getAccounts().then((f) => {
console.log("Retrevivng accounts");
 account = f[1];

 //Call functions here
 underwrite(account);
 //checkInsured(account);
 //getPremium(account);
 //payPremiumFor(f[2],f[1])
 //claim(account);
})
    


function underwrite (senderAddress) {
    console.log("Underwriting a new policy")

    contract.methods.underwrite()
    .send({from: senderAddress, value:amount})
    .then((f)=>{ return f })
}

function checkInsured(accountAddress){
    console.log("Checking if insured")

    contract.methods.isInsured(accountAddress)
    .call()
    .then((f)=>{console.log(f)})
}

function getPremium(accountAddress)
{
    console.log("Getting Premium");

    contract.methods.getPremium(accountAddress)
    .call()
    .then((f)=>{console.log(f)})
    
}

function payPremiumFor(senderAccount, insuranceAccount)
{
    console.log("Paying Premium");

    contract.methods.payPremiumFor(insuranceAccount)
    .send({from: senderAccount, value:amount})
    .then((f)=>{console.log(f)})
}

function claim(accountAddress)
{
    console.log("Claiming Insurance");

    contract.methods.claim()
    .call({from: accountAddress})
    .then((f)=>{console.log(f)})
}


