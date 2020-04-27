const express = require('express');
const routing = express.Router();
Web3 = require('web3');
fs = require("fs");

abiFile= __dirname+'/Insurance_sol_CarInsurance.abi'
console.log(abiFile)

//Policy Premium Value
const amount = 1e17;

//Web3 Configuration
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
abi = JSON.parse(fs.readFileSync(abiFile).toString())
contract = new web3.eth.Contract(abi)

//Update the contract address here.
contract.options.address = "0xf855a4D69cf05Cd4806ba4c83ED2C772E49a967C";


// Routing Code


routing.get('/underwrite/:accountAddress', (req,res)=>{
    console.log("Routing to underwriting");
    var senderAddress = req.params.accountAddress;
    
    console.log("Underwrititng a new policy")
    contract.methods.underwrite()
    .send({from: senderAddress, value:amount})
    .then((receipt)=>{ console.log(receipt); res.json(receipt); })
    .catch(console.log)

})

routing.get('/isInsured/:accountAddress', (req,res)=>{
    console.log("Routing to isInsured");
    var senderAddress = req.params.accountAddress;

    console.log("Checking if insured")
    contract.methods.isInsured(senderAddress)
    .call()
    .then((f)=>{console.log(f); res.json({isInsured:f});})
    .catch(console.log)
})

routing.get('/getPremium/:accountAddress', (req,res)=>{
    console.log("Routing to getPremium");
    var senderAddress = req.params.accountAddress;

    console.log("Getting Premium")
    contract.methods.getPremium(senderAddress)
    .call()
    .then((f)=>{console.log(f); res.json({premium:f})})
    .catch(console.log)
})

routing.get('/payPremium/:senderAccount/:insuranceAccount', (req,res)=>{
    console.log("Routing to payPremium");
    var senderAddress = req.params.senderAccount;
    var insuredAccount = req.params.insuranceAccount
    
    console.log("Paying Premium")
    contract.methods.payPremiumFor(insuredAccount)
    .send({from: senderAddress, value:amount})
    .then((f)=>{console.log(f); res.json(f);})
    .catch(console.log)
})

/* Claim not yet working. Still figuring it out 

routing.get('/claim/:accountAddress', (req,res)=>{
    console.log("Routing to claim");
    var senderAddress = req.params.accountAddress;
    
    console.log("Claiming Insurance");
    contract.methods.claim()
    .call({from: senderAddress})
    .then((f)=>{console.log(f); res.json(f);})
})

*/

module.exports= routing;