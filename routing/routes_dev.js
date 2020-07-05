
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
contract.options.address = "0x85AedE8F9fB640859B8b2D005d5EdE85A7Da2A9a"


// Routing Code

//Route Example (GET): http://localhost:5000/dev/getAccountBalance/<Account Address>
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

//Route Example (GET): http://localhost:5000/dev/isInsured/<Account Address>
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

//Route Example (GET): http://localhost:5000/dev/getPremium/<Account Address>
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

//Route Example (GET): http://localhost:5000/dev/getLocation/<Account Address>
routing.get('/getLocation/:accountAddress', (req,res)=>{
    console.log("Routing to getLocation");
    var senderAddress = req.params.accountAddress;

    web3.eth.getAccounts().then((allAccounts)=>{
        if(senderAddress!== null &&  allAccounts.includes(senderAddress))
        {
            console.log("Retrieving Location")
            contract.methods.getLocation(senderAddress)
            .call()
            .then((f)=>{console.log(f); res.json({"lat/lon":f});})
            .catch(console.log)
        }
        else{
            console.log("Invalid Account Address")
            res.status(403);
            res.json({'error':'Invalid Account Address'});
        }
    })
})

/*
Route Example (POST): http://localhost:5000/dev/signUp/<Account Address>
JSON Body: {"aadhar":<Aadhar Number>, 
            "surveyNo":<Survey Number>,
            "location":<Latitude/Longitude>,
            "policyPeriod":<Policy Duration>, 
            "premiumAmount":<Premium Amount>}
*/
routing.post('/signUp/:accountAddress', (req,res)=>{
    console.log("Routing to underwriting");
    var senderAddress = req.params.accountAddress;

    var {aadhar, surveyNo, location, policyPeriod, premiumAmount} = req.body;

    console.log("Underwrititng a new policy")
    //var amount = parseInt(premiumAmount);
    web3.eth.getAccounts().then((allAccounts)=>{
        if(senderAddress!== null &&  allAccounts.includes(senderAddress))
        {
            contract.methods.signUp(aadhar, surveyNo, location, policyPeriod, web3.utils.toWei(premiumAmount,'ether'))
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

//Route Example (POST): http://localhost:5000/dev/payPremium/<Account Address>
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

//Route Example (GET): http://localhost:5000/dev/claim/<SPI Value>/<Account Address>
routing.get('/claim/:spi/:accountAddress', (req,res)=>{
    console.log("Routing to claim");
    var senderAddress = req.params.accountAddress;
    var spi = req.params.spi;
    
    console.log("Claiming Insurance");
    web3.eth.getAccounts().then((allAccounts)=>{
        if(senderAddress!== null &&  allAccounts.includes(senderAddress))
        {
            contract.methods.claim(spi)
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

//Route Example (GET): http://localhost:5000/dev/deposit/<Deposit in Ether>/<Account Address>
routing.get('/deposit/:depositAmount/:accountAddress', (req,res)=>{
    console.log("Routing to deposit");
    var senderAddress = req.params.accountAddress;
    var depositAmount = req.params.depositAmount;
    
    console.log("Depositing to contract");
    web3.eth.getAccounts().then((allAccounts)=>{
        if(senderAddress!== null &&  allAccounts.includes(senderAddress))
        {
            contract.methods.deposit()
            .send({from: senderAddress,
                    value: web3.utils.toWei(depositAmount,'ether')
            })
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
