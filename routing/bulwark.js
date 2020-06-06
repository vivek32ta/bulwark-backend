
const express = require('express')
const fs = require("fs")
const passport = require('passport')
const path = require('path')
const Web3 = require('web3')

const routing = express.Router()
const abiFile = path.resolve(__dirname, '..' , 'contracts/Insurance_sol_Insurance.abi')

//Web3 Configuration
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const abi = JSON.parse(fs.readFileSync(abiFile).toString())
const contract = new web3.eth.Contract(abi)

//Update the contract address here.
contract.options.address = "0x1efb58C06149090795dA60088E1E0cF29Ff0517C"


// Get Account Balance
routing.get('/getAccountBalance', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[balance check] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})

    web3.eth.getAccounts()
        .then(allAccounts =>{
            if(accountAddress && allAccounts.includes(accountAddress))
                web3.eth.getBalance(accountAddress)
                    .then(bal => { 
                        console.log(`[balance check] ${userID} -- ${accountAddress}`, web3.utils.fromWei(bal)) 
                        res.json({
                            account: accountAddress,
                            balance: web3.utils.fromWei(bal)
                        }) 
                    })
                    .catch(err => {
                        res.status(500).json({err: 'check bulwark console.'})
                        console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
                        console.log(err)
                    })
            else console.log(`[balance check] ${userID} -- ${accountAddress} - Invalid Account Address`)
                && res.status(403).json({err: 'Invalid Account Address'})
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})

//Route Example (GET): http://localhost:5000/isInsured/<Account Address>
routing.get('/isInsured', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[insurance check] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})

    web3.eth.getAccounts()
        .then(allAccounts => {
            if(accountAddress && allAccounts.includes(accountAddress))
                contract.methods.isInsured(accountAddress)
                    .call()
                    .then(f => {
                        console.log(`[insurance check] ${userID} -- ${accountAddress} isInsured: ${f}`)
                        res.json({ isInsured: f })
                    })
                    .catch(err => {
                        res.status(500).json({err: 'check bulwark console.'})
                        console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
                        console.log(err)
                    })
            else console.log(`[insurance check] ${userID} -- ${accountAddress} - Invalid Account Address`)
                && res.status(403).json({'error':'Invalid Account Address'})
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })

})

/*
Route Example (POST): http://localhost:5000/signUp/<Account Address>
JSON Body: {"customerName":<Customer Name>, "vehicleNo":<Vehicle Number>}
*/
routing.post('/signUp', passport.authenticate('jwt', {session: false}), (req, res) => {

    const vehicleNo = req.body.vehicleNo
    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[bulwark register] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})
    console.log("Underwrititng a new policy")

    web3.eth.getAccounts()
        .then(allAccounts => {
            if(accountAddress && allAccounts.includes(accountAddress))
                contract.methods.signUp(userID, vehicleNo)
                    .send({from: accountAddress,
                            value: web3.utils.toWei('1', 'ether'),
                            gas: 210000
                        })
                    .then(receipt => {
                        console.log(receipt)
                        res.json(receipt)
                    })
                    .catch(err => {
                        res.status(500).json({err: 'check bulwark console.'})
                        console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
                        console.log(err)
                    })
            else console.log(`[insurance check] ${userID} -- ${accountAddress} - Invalid Account Address`)
                && res.status(403).json({'error':'Invalid Account Address'})
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})

//Route Example (GET): http://localhost:5000/payPremium/<Account Address>
routing.get('/payPremium', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[paying premium] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})
    console.log("Paying Premium")

    web3.eth.getAccounts()
        .then(allAccounts => {
            if(accountAddress && allAccounts.includes(accountAddress))
                contract.methods.payPremium(accountAddress)
                    .send({
                        from: accountAddress,
                        value: web3.utils.toWei('1','ether')
                    })
                    .then(receipt => {
                        console.log(receipt)
                        res.json(receipt)
                    })
                    .catch(err => {
                        res.status(500).json({err: 'check bulwark console.'})
                        console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
                        console.log(err)
                    })
            else res.status(403).json({'error':'Invalid Account Address'})
                && console.log(`[paying premium] ${userID} -- ${accountAddress} - Invalid Account Address`)
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})

//Route Example (GET): http://localhost:5000/claim/<Account Address>
routing.get('/claim', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[processing claim] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})
    console.log("Routing to claim")
    
    console.log("Claiming Insurance")
    web3.eth.getAccounts()
        .then(allAccounts => {
            if(accountAddress && allAccounts.includes(accountAddress))
                contract.methods.claim()
                .send({from: accountAddress})
                .then(receipt => {
                    console.log(receipt)
                    res.json(receipt)
                })
                .catch(err => {
                    res.status(500).json({err: 'check bulwark console.'})
                    console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
                    console.log(err)
                })
            else res.status(403).json({'error':'Invalid Account Address'})
                && console.log(`[processing claim] ${userID} -- ${accountAddress} - Invalid Account Address`)
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[bulwark register] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})



/*
routing.get('/getPremium/:accountAddress', (req,res)=>{
    console.log("Routing to getPremium");
    var senderAddress = req.params.accountAddress;

    console.log("Getting Premium")
    contract.methods.getPremium(senderAddress)
    .call()
    .then((f)=>{console.log(f); res.json({premium:f})})
    .catch(console.log)
})
*/



module.exports = routing
