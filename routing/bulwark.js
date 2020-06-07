
const express = require('express')
const fs = require("fs")
const passport = require('passport')
const path = require('path')

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

// Sign up user on blockchain
routing.post('/signUp', passport.authenticate('jwt', {session: false}), (req, res) => {

    const {data} = req.body
    const {insurancePeriod, vehicleNo} = data
    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[bulwark_register] ${userID} -- ${accountAddress}`)

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
                        console.log(`[bulwark_register] ${userID} -- ${accountAddress} contract-err`)
                        console.log(err)
                    })
            else console.log(`[bulwark_register] ${userID} -- ${accountAddress} - Invalid Account Address`)
                && res.status(403).json({'error':'Invalid Account Address'})
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[bulwark_register] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})

// Pay premium
routing.get('/payPremium', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[paying_premium] ${userID} -- ${accountAddress}`)

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
                        console.log(`[paying_premium] ${userID} -- ${accountAddress} contract-err`)
                        console.log(err)
                    })
            else res.status(403).json({'error':'Invalid Account Address'})
                && console.log(`[paying_premium] ${userID} -- ${accountAddress} - Invalid Account Address`)
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[paying_premium] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})

// Issue a claim
routing.get('/claim', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[processing_claim] ${userID} -- ${accountAddress}`)

    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})

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
                    console.log(`[processing_claim] ${userID} -- ${accountAddress} contract-err`)
                    console.log(err)
                })
            else res.status(403).json({'error':'Invalid Account Address'})
                && console.log(`[processing_claim] ${userID} -- ${accountAddress} - Invalid Account Address`)
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[processing_claim] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})

module.exports = routing
