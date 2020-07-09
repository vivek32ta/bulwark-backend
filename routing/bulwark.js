
const express  = require('express')
const passport = require('passport')

const {web3}         = require('../web3/bulwark-core.js')
const {calculateSPI} = require('../utilities/spi-core.js')

const routing = express.Router()

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

module.exports = routing
