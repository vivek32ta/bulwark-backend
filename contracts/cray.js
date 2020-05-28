Web3 = require('web3');
fs = require("fs");
const amount = 1e17;
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
abi = JSON.parse(fs.readFileSync("Insurance_sol_Insurance.abi").toString())
contract = new web3.eth.Contract(abi)

//Update the contract address here.
contract.options.address = "0x6E3372cB3fe9E95F9A9DEaD75B1fd4A698393Dc6";

var account;
web3.eth.getAccounts().then((f) => {
console.log("Retrevivng accounts");
 account = f[1];


 //Call functions here
 //getAccountBalance(f[1])
 //underwrite(f[3]);
 //checkInsured(account);
 //getPremium(account); //Made internal
 //payPremium(f[1])
 //claim(f[1]);
})
  

function getAccountBalance(accountAddress)
{
    web3.eth.getAccounts().then((allAccounts)=>{
        if(accountAddress!== null &&  allAccounts.includes(accountAddress))
        {
            console.log("Checking Balance");
            web3.eth.getBalance(accountAddress).then(f=>{
            console.log(web3.utils.fromWei(f))});
        }
        else{
            console.log("Invalid Address")
        }
    })
}


function underwrite (senderAddress) {
    console.log("Underwriting a new policy")

    contract.methods.signUp('Bob','1002')
    .send({from: senderAddress,
            value: web3.utils.toWei('1','ether'),
            gas:210000
        })
    .then((f)=>{ console.log(f) })
    .err((e)=>console.log(e))
}

function checkInsured(accountAddress){
    console.log("Checking if insured")

    contract.methods.isInsured()
    .send({from: senderAddress})
    .then((f)=>{console.log(f)})
}

/*
function getPremium(accountAddress)
{
    console.log("Getting Premium");

    contract.methods.getPremium(accountAddress)
    .call()
    .then((f)=>{console.log(f)})
    
}*/

function payPremium(accountAddress)
{
    console.log("Paying Premium");

    contract.methods.payPremium(accountAddress)
    .send({
        from: accountAddress, 
        value: web3.utils.toWei('1','ether')})
    .then((f)=>{console.log(f)})
}

function claim(accountAddress)
{
    console.log("Claiming Insurance");

    contract.methods.claim()
    .send({from: accountAddress})
    .then((f)=>{console.log(f)})
}


