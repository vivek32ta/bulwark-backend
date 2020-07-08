
const express = require('express')
const fs = require("fs")
const passport = require('passport')
const path = require('path')
const Web3 = require('web3')
const {calculateSPI} = require('../utilities/spi-core.js')

const routing = express.Router()

// Get Account Balance
routing.get('/getAccountBalance', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[balance_check] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})

    web3.eth.getAccounts()
        .then(allAccounts =>{
            if(accountAddress && allAccounts.includes(accountAddress))
                web3.eth.getBalance(accountAddress)
                    .then(bal => { 
                        console.log(`[balance_check] ${userID} -- ${accountAddress}`, web3.utils.fromWei(bal)) 
                        res.json({
                            account: accountAddress,
                            balance: web3.utils.fromWei(bal)
                        }) 
                    })
                    .catch(err => {
                        res.status(500).json({err: 'check bulwark console.'})
                        console.log(`[balance_check] ${userID} -- ${accountAddress} contract-err`)
                        console.log(err)
                    })
            else console.log(`[balance_check] ${userID} -- ${accountAddress} - Invalid Account Address`)
                && res.status(403).json({err: 'Invalid Account Address'})
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[balance_check] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})


// Check if user is Insured
routing.get('/isInsured', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[insurance_check] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})

    web3.eth.getAccounts()
        .then(allAccounts => {
            if(accountAddress && allAccounts.includes(accountAddress))
                contract.methods.isInsured(accountAddress)
                    .call()
                    .then(f => {
                        console.log(`[insurance_check] ${userID} -- ${accountAddress} isInsured: ${f}`)
                        res.json({ isInsured: f })
                    })
                    .catch(err => {
                        res.status(500).json({err: 'check bulwark console.'})
                        console.log(`[insurance_check] ${userID} -- ${accountAddress} contract-err`)
                        console.log(err)
                    })
            else console.log(`[insurance_check] ${userID} -- ${accountAddress} - Invalid Account Address`)
                && res.status(403).json({'error':'Invalid Account Address'})
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[insurance_check] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })

})

//Getting premium amount of a user
routing.get('/getPremium', passport.authenticate('jwt',{session:false}), (req,res)=>{
    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[insurance_check] ${userID} -- ${accountAddress}`)

    //if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})

    web3.eth.getAccounts()
        .then(allAccounts => {
            if(accountAddress && allAccounts.includes(accountAddress))
                contract.methods.getPremium(accountAddress)
                    .call()
                    .then(f => {
                        console.log(`[get_premium] ${userID} -- ${accountAddress} premiumAmount: ${f}`)
                        res.json({ premiumAmount: f })
                    })
                    .catch(err => {
                        res.status(500).json({err: 'check bulwark console.'})
                        console.log(`[insurance_check] ${userID} -- ${accountAddress} contract-err`)
                        console.log(err)
                    })
            else console.log(`[insurance_check] ${userID} -- ${accountAddress} - Invalid Account Address`)
                && res.status(403).json({'error':'Invalid Account Address'})
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[insurance_check] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})

// Pay premium
routing.get('/payPremium', passport.authenticate('jwt', {session: false}), async (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[paying_premium] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})
    console.log("Paying Premium")

    web3.eth.getAccounts()
         .then(allAccounts => {
            if(accountAddress && allAccounts.includes(accountAddress))
                contract.methods.getPremium(accountAddress)
                .call()
                .then((premium)=>{
                    console.log("Premium: "+web3.utils.fromWei(premium,'ether')); 

                    contract.methods.payPremium(accountAddress)
                    .send({ from: accountAddress
                            ,value: premium })
                        .then((receipt)=>{res.json(receipt)})
                        .catch(err => {
                            res.status(500).json({err: 'check bulwark console.'})
                            console.log(`[paying_premium] ${userID} -- ${accountAddress} contract-err`)
                            console.log(err)
                        })
                })
            else res.status(403).json({'error':'Invalid Account Address'})
                 && console.log(`[paying_premium] ${userID} -- ${accountAddress} - Invalid Account Address`)
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[paying_premium] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
    })
})


// Issue a claim
routing.get('/claim', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[processing_claim] ${userID} -- ${accountAddress}`)

    

    User.findById(userID)
		.then(async user => {
            if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[claim_policy - user not found] ${userID}`)
            else {
                let {location} = user.insurance
                const _data = {
                    lat: location.lat.toString(),
                    lon: location.lon.toString(),
                    end: new Date().toISOString().slice(0,10),
                    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10)
                }

                try {
                    const spi = await calculateSPI(_data)
                    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})
                    //if(spi>=1 && spi<=4) return res.json({err: 'No catastrophe detected'})

                    web3.eth.getAccounts()
                        .then(allAccounts => {
                            if (accountAddress && allAccounts.includes(accountAddress))
                                contract.methods.claim(spi)
                                    .send({ from: accountAddress })
                                    .then(receipt => {
                                        console.log(receipt)
                                        res.json(receipt)
                                    })
                                    .catch(err => {
                                        res.status(500).json({ err: 'check bulwark console.' })
                                        console.log(`[processing_claim] ${userID} -- ${accountAddress} contract-err`)
                                        console.log(err)
                                    })
                            else res.status(403).json({ 'error': 'Invalid Account Address' })
                                && console.log(`[processing_claim] ${userID} -- ${accountAddress} - Invalid Account Address`)
                        })
                        .catch(err => {
                            res.status(500).json({ err: 'check bulwark console.' })
                            console.log(`[processing_claim] ${userID} -- ${accountAddress} contract-err`)
                            console.log(err)
                        })
                
                }
                catch(err){
                    console.log(`[claim_policy] ${userID} - err`)
                    console.log(err)
                    res.status(500).json({err: 'check bulwark console'})
                }
                
            }
        })

})


// Sign up user on blockchain
routing.post('/signUp', passport.authenticate('jwt', {session: false}), (req, res) => {

    const {data} = req.body
    const {aadhar, surveyNo, location, interval, premiumAmount} = data
    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[BULWARK sign_up] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})
    console.log("Underwrititng a new policy")

    web3.eth.getAccounts()
        .then(allAccounts => {
            if(accountAddress && allAccounts.includes(accountAddress))
                contract.methods.signUp(aadhar, surveyNo, location, interval, web3.utils.toWei(`${premiumAmount}`,'ether'))
                    .send({ from: accountAddress
                            ,value: web3.utils.toWei(`${premiumAmount}`, 'ether')
                            ,gas: 210000 })
                    .then(receipt => {
                        console.log(`[BULWARK sign_up] success ${address}`)
                        res.json(receipt)
                    })
                    .catch(err => {
                        console.log(`[BULWARK sign_up] failed ${address}`)
                    })
            else console.log(`[BULWARK sign_up] ${userID} -- ${accountAddress} - Invalid Account Address`)
                && res.status(403).json({'error':'Invalid Account Address'})
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[BULWARK sign_up] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})


module.exports = routing
