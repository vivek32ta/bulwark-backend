
const express = require('express')
const routing = express.Router()
Web3 = require('web3')
fs = require("fs")
const path = require('path')


abiFile = path.resolve(__dirname, '..' , 'contracts/Insurance_sol_Insurance.abi')

//Policy Premium Value
const amount = 1e17;

//Web3 Configuration
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
abi = JSON.parse(fs.readFileSync(abiFile).toString())
contract = new web3.eth.Contract(abi)

//Update the contract address here.
contract.options.address = "0x29fbeF6F5b3DaA194e7c752c4A3Fae0CB0A6Cd71"


// Routing Code

//Route Example (GET): http://localhost:5000/getAccountBalance/<Account Address>
routing.get('/getAccountBalance/:accountAddress', (req,res)=>{

    console.log("Routing to getAccountBalance")
    var accountAddress = req.params.accountAddress;
    web3.eth.getAccounts().then((allAccounts)=>{
        console.log("Checking Balance");

        if(accountAddress!== null &&  allAccounts.includes(accountAddress))
        {
            web3.eth.getBalance(accountAddress).then((bal)=>{ 
                console.log('Balance: ',web3.utils.fromWei(bal)); 
                res.json({
                    account:accountAddress,
                    balance:web3.utils.fromWei(bal)
                }); 
            })
        }
        else{
            console.log("Invalid Account Address")
            res.status(403);
            res.json({'error':'Invalid Account Address'});
        }
    })
})

//Route Example (GET): http://localhost:5000/isInsured/<Account Address>
routing.get('/isInsured/:accountAddress', (req,res)=>{
    console.log("Routing to isInsured");
    var senderAddress = req.params.accountAddress;

    web3.eth.getAccounts().then((allAccounts)=>{
        if(senderAddress!== null &&  allAccounts.includes(senderAddress))
        {
            console.log("Checking if insured")
            contract.methods.isInsured(senderAddress)
            .call()
            .then((f)=>{console.log(f); res.json({isInsured:f});})
            .catch(console.log)
        }
        else{
            console.log("Invalid Account Address")
            res.status(403);
            res.json({'error':'Invalid Account Address'});
        }
    })
})

//ALERT: New Route!
//Route Example (GET): http://localhost:5000/getPremium/<Account Address>
routing.get('/getPremium/:accountAddress', (req,res)=>{
    console.log("Routing to getPremium");
    var senderAddress = req.params.accountAddress;

    console.log("Getting Premium")
    contract.methods.getPremium(senderAddress)
    .call()
    .then((f)=>{
            console.log(web3.utils.fromWei(f,'ether')); 
            res.json({premium:web3.utils.fromWei(f,'ether')})
        })
    .catch(console.log)
})

/*
Route Example (POST): http://localhost:5000/signUp/<Account Address>
JSON Body: {"customerName":<Customer Name>, "vehicleNo":<Vehicle Number>, "premiumAmount":<Premium Amount>}
*/
routing.post('/signUp/:accountAddress', (req,res)=>{
    console.log("Routing to underwriting");
    var senderAddress = req.params.accountAddress;

    var {customerName, vehicleNo, premiumAmount} = req.body;
    
    console.log("Underwrititng a new policy")
    //var amount = parseInt(premiumAmount);
    web3.eth.getAccounts().then((allAccounts)=>{
        if(senderAddress!== null &&  allAccounts.includes(senderAddress))
        {
            contract.methods.signUp(customerName, vehicleNo, web3.utils.toWei(premiumAmount,'ether'))
            .send({from: senderAddress,
                    value: web3.utils.toWei(premiumAmount,'ether'),
                    gas:210000
                })
            .then((receipt)=>{ console.log(receipt); res.json(receipt);})
            .catch(console.log)
        }
        else{
            console.log("Invalid Account Address")
            res.status(403);
            res.json({'error':'Invalid Account Address'});
        }
    })

})

//Route Example (POST): http://localhost:5000/payPremium/<Account Address>
routing.post('/payPremium/:accountAddress/', (req,res)=>{
    console.log("Routing to payPremium");
    var senderAddress = req.params.accountAddress;
    var {premiumAmount} = req.body;
    
    console.log("Paying Premium")

    web3.eth.getAccounts().then((allAccounts)=>{
        if(senderAddress!== null &&  allAccounts.includes(senderAddress))
        {
            contract.methods.payPremium(senderAddress)
            .send({
                from: senderAddress, 
                value: web3.utils.toWei(premiumAmount,'ether')})
            .then((receipt)=>{console.log(receipt); res.json(receipt);})
            .catch(console.log)
        }
        else{
            console.log("Invalid Account Address")
            res.status(403);
            res.json({'error':'Invalid Account Address'});
        }
    })
})

//Route Example (GET): http://localhost:5000/claim/<Account Address>
routing.get('/claim/:accountAddress', (req,res)=>{
    console.log("Routing to claim");
    var senderAddress = req.params.accountAddress;
    
    console.log("Claiming Insurance");
    web3.eth.getAccounts().then((allAccounts)=>{
        if(senderAddress!== null &&  allAccounts.includes(senderAddress))
        {
            contract.methods.claim()
            .send({from: senderAddress})
            .then((receipt)=>{console.log(receipt); res.json(receipt);})
            .catch(console.log)
        }
        else{
            console.log("Invalid Account Address")
            res.status(403);
            res.json({'error':'Invalid Account Address'});
        }
    })
})





module.exports= routing;
