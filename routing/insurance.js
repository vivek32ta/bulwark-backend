
const express = require('express')
const router = express.Router()
const passport = require('passport')

const User = require('../models/User')

const {getJwtToken, getPremiumPrice, getResponsePayload} = require('../utilities/util.js')
const {payPremium, signUp} = require('../web3/bulwark-core.js')

router.get('/new', passport.authenticate('jwt', {session: false}), (req, res) => {

	const userID = req.user.user
    console.log(`[new_insurance] ${userID}`)

	User.findById(userID)
		.then(async user => {
            console.log(user)
            if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[new_insurance - not found] ${userID}`)
            else {
                const premiumAmount = await getPremiumPrice(user.insurance.coverage)
                let {location} = user.insurance
                location = `lat=${location.lat}&lon=${location.lon}`
                const _data = {
                    userID: user._id.toString(),
                    address: user.keys.public,
                    premiumAmount,
                    location,
                    aadhar: user.insurance.aadhar,
                    surveyNo: user.insurance.surveyNo,
                    interval: user.insurance.interval
                }

                try {
                    let _res = await signUp(_data)
                    console.log(_res)
                    user.insurance.insured = true
                    user.insurance.date = new Date()
                    return user.save()
                } catch(err) {
                    console.log(`[new_insurance] ${userID} - err`)
                    console.log(err)
                    res.status(500).json({err: 'check bulwark console'})
                }
            }
        })
        .then(async _user => {
            if(!_user) return
            try {
                const token = await getJwtToken({ user: _user._id, address: _user.keys.public })
                const user = await getResponsePayload(_user, token)
                res.json({msg: 'Successfully configured.', user})
                console.log(`[new_insurance - success] ${userID}`)
            } catch(err) {
                console.log(`[new_insurance] ${userID} - err`)
                console.log(err)
                res.status(500).json({err: 'check bulwark console'})
            }
        })
        .catch(err => {
			res.status(500).json({err: 'check bulwark console.'})
			console.log(`[new_insurance - mongo-err] ${userID}`)
			console.log(err)
		})
})

router.get('/pay', passport.authenticate('jwt', {session: false}), (req, res) => {
    const userID  = req.user.user
    const address = req.user.address

    User.findById(userID)
        .then(async user => {
            if(!user) {
                res.status(500).json({err: 'User not found.'})
                console.log(`[pay-premium] user not found in DB ${userID}`)
            } else {
                try {
                    const receipt          = await payPremium(address)
                    receipt.date           = user.insurance.date
                    receipt.interval       = user.insurance.interval
                    user.insurance.insured = true
                    const date             = new Date(user.insurance.date)
                    user.insurance.date    = date.setDate(date.getDate() + user.insurance.interval)
                    user.save()
                        .then(async _user => {
                            const tokenPayload = {user: _user._id, address: _user.keys.public}
                            const token        = await getJwtToken(tokenPayload)
                            const payload      = await getResponsePayload(_user, token)
                            res.json({user: payload, receipt})
                        })
                } catch(err) {
                    res.status(500).json({err})
                    console.log(`[pay-premium] err ${userID}`)
                    console.log(err)
                }
            }
        })
        .catch(err => {
            res.status(500).json({err: 'check bulwark console.'})
            console.log(`[pay-premium - mongo-err] ${userID}`)
            console.log(err)
        })
})

module.exports = router
