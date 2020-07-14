
const express  = require('express')
const mongoose = require('mongoose')
const passport = require('passport')

const {web3, isInsured, transactions}         = require('../web3/bulwark-core.js')
const {getWeatherForecast} = require('../utilities/util.js')
const {calculateSPI} = require('../utilities/spi-core.js')
const Data           = require('../models/Data')
const User           = require('../models/User')

const routing = express.Router()


//Checking if insured

routing.get('/isInsured', passport.authenticate('jwt', {session: false}), async (req,res) =>{

    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(`[checking_insured] ${userID} -- ${accountAddress}`)
    try {
        const insured = await isInsured(accountAddress)
        res.status(200).json({isInsured : insured})
    }
    catch { (res.status(500).json({err: "Check bulwark console."}))}
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
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[paying_premium] ${userID} -- ${accountAddress} contract-err`)
            console.log(err)
        })
})


// Issue a claim
routing.post('/claim', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    const claim = req.body.data
    console.log(claim)
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
                    console.log(spi)
                    if(!accountAddress) return res.json({err: 'User not registered on Bulwark.'})
                    if(spi>=1 && spi<=4) {

                        const err = 'Not catastrophe detected.'
                        claim.info = {err}
                        claim.processed = false

                        Data.findOne({user: userID})
                            .then(data => {
                                data.claims.push(claim)
                                data.save()
                                    .then(data => res.json(data.claims.slice(-1)[0]))
                            })
                    }

                    console.log(`[processing_claim] catastrophe detected. SPI: ${spi}`)

                    web3.eth.getAccounts()
                        .then(allAccounts => {
                            if (accountAddress && allAccounts.includes(accountAddress))
                                contract.methods.claim(spi)
                                    .send({ from: accountAddress })
                                    .then(receipt => {
                                        console.log(`[processing_claim] claim processed ${userID}`)
                                        claim.info = {...receipt}
                                        claim.processed = true
                                        console.log(claim)
                                        Data.findOne({user: userID})
                                            .then(data => {
                                                data.claims.push(claim)
                                                data.save()
                                                    .then(data => res.json(data.claims.slice(-1)[0]))
                                            })
                                    })
                                    .catch(err => {
                                        res.json({ err: 'check bulwark console.' })
                                        console.log(`[processing_claim] ${userID} -- ${accountAddress} contract-err`)
                                        console.log(err)
                                    })
                            else res.json({ err: 'Invalid Account Address' })
                                && console.log(`[processing_claim] ${userID} -- ${accountAddress} - Invalid Account Address`)
                        })
                        .catch(err => {
                            res.json({ err: 'check bulwark console.' })
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

//Get transaction history by account


//Get Transactions by account
routing.get('/getTransactions', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(accountAddress)
    console.log(`[getting_ transactions] ${userID} -- ${accountAddress}`)
    await transactions(accountAddress).then(data=>{res.status(200).json(data)});
})

routing.get('/getWeather', passport.authenticate('jwt', {session: false}), (req, res)=>{
    const userID = req.user.user
    const accountAddress = req.user.address

    User.findById(userID)
		.then(async user => {
            if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[weather_forecast - user not found] ${userID}`)
            else {
                let {location} = user.insurance
                console.log("Lat: "+location.lat+"\nLon: "+location.lon)
                const data = await getWeatherForecast(location)
                console.log(data.current)
                const weather={
                    temp: (data.current.temp-273.15).toFixed(1),
                    humidity: data.current.humidity,
                    info: data.current.weather[0].main
                }
                res.status(200).json(weather);
                
            }
        })

})

module.exports = routing
