
const express = require('express')
const router = express.Router()
const fs = require('fs')
const passport = require('passport')

const {getJwtToken, getPremiumPrice, getResponsePayload} = require('./routing-helpers.js')

const {accountCheck, signUp} = require('../web3/bulwark-core.js')

router.get('/new', passport.authenticate('jwt', {session: false}), (req, res) => {

	const userID = req.user.user
    console.log(`[new_insurance] ${userID}`)

	User.findById(userID)
		.then(async user => {
            if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[new_insurance - not found] ${userID}`)
            else {
                const premiumAmount = getPremiumPrice(user.insurance.interval)
                let {location} = user.insurance
                location = `lat=${location.lat}&lon=${location.lon}`
                const _data = {
                    userID: user._id.toString(),
                    address: user.keys.public,
                    premiumAmount,
                    location,
                    aadhar: user.insurance.aadhar,
                    surveyNo: 'totallyforgotaboutthis',
                    interval: user.insurance.interval
                }

                try {
                    let _res = await signUp(_data)
                    console.log(_res)
                    user.insurance.insured = true
                    return user.save()
                } catch(err) {
                    console.log(`[new_insurance] ${userID} - err`)
                    console.log(err)
                    res.status(500).json({err: 'check bulwark console'})
                }
            }
        })
        .then(async _user => {
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

module.exports = router
