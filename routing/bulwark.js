
const express  = require('express')
const passport = require('passport')

const {web3, isInsured} = require('../web3/bulwark-core.js')
const {getCurrentPrice} = require('../utilities/util.js')
const {calculateSPI} = require('../utilities/spi-core.js')
const Data           = require('../models/Data')
const User           = require('../models/User')

const routing = express.Router()

// Issue a claim
routing.post('/claim', passport.authenticate('jwt', {session: false}), (req, res) => {

    const userID = req.user.user
    const accountAddress = req.user.address
    const claim = req.body.data
    console.log(claim)
    console.log(`[claim_policy] ${userID} -- ${accountAddress}`)

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

                    if(spi>=1 && spi<=4) {
                        console.log(`[claim_policy] No catastrophe detected. SPI: ${spi}`)

                        const err = 'No catastrophe detected.'
                        claim.info = {err}
                        claim.status = 'fail'

                        Data.findOne({user: userID})
                            .then(data => {
                                data.claims.push(claim)
                                data.save()
                                    .then(data => res.json(data.claims.slice(-1)[0]))
                            })
                    } else {
                        console.log(`[claim_policy] catastrophe detected. SPI: ${spi}`)

                        web3.eth.getAccounts()
                            .then(allAccounts => {
                                if (accountAddress && allAccounts.includes(accountAddress))
                                    contract.methods.claim(spi)
                                        .send({ from: accountAddress })
                                        .then(receipt => {
                                            console.log(`[processing_claim] claim submitted ${userID}`)
                                            claim.info = {...receipt}
                                            claim.status = 'processing'
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
                            })
                            .catch(err => console.log(err))
                    }
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
const transactions = (accountAddress) => {
    return new Promise((resolve, reject) => {
        var result = []
        web3.eth.getBlockNumber().then(async (endBlockNumber) => {
            var startBlockNumber = endBlockNumber - 1000;
            var rate = await getCurrentPrice('inr')

            for (var i = startBlockNumber; i <= endBlockNumber; i++) {
                if (i % 1000 == 0) { console.log("[transactions] Getting transactions"); }

                await web3.eth.getBlock(i, true).then(block => {
                    if (block != null && block.transactions != null) {
                        block.transactions.forEach(function (e) {
                            if (accountAddress == "*" || accountAddress == e.from || accountAddress == e.to) {
                                

                                var tx = {
                                    txhash: e.hash,
                                    blockHash: e.blockHash,
                                    blockNumber: e.blockNumber,
                                    transactionIndex: e.transactionIndex,
                                    from: e.from,
                                    to: e.to,
                                    value: (rate * web3.utils.fromWei(e.value,'ether')).toFixed(2)+" INR",
                                    time: new Date(block.timestamp * 1000).toLocaleString(),
                                    gasPrice: e.gasPrice,
                                    gas: e.gas,
                                    input: e.input
                                }
                                result.push(tx)
                            }
                        })
                    }
                }).catch(err => { reject(err) })
            }
            resolve(result)
        }).catch(err => { reject(err) })
    })
}

//Get Transactions by account
routing.get('/getTransactions', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const userID = req.user.user
    const accountAddress = req.user.address
    console.log(accountAddress)
    console.log(`[getting_ transactions] ${userID} -- ${accountAddress}`)
    await transactions(accountAddress).then(data=>{res.status(200).json(data)});
})

module.exports = routing
