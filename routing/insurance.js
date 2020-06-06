
const express = require('express')
const router = express.Router()
const fs = require('fs')
const passport = require('passport')
const path = require('path')

const ADDR_PATH = path.resolve(__dirname, '../bulwark-data/address-and-keys')
const {getJwtToken, getResponsePayload} = require('./routing-helpers.js')

router.post('/new', passport.authenticate('jwt', {session: false}), (req, res) => {

    const {insuranceData} = req.body
    const {insurance, dl} = insuranceData
	const userID = req.user.user

	console.log(`[new_insurance] ${userID}`)

	User.findById(userID)
		.then(user => {
			if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[new_insurance - not found] ${userID}`)
			else fs.promises.readFile(ADDR_PATH, 'utf8')
					.then(data => {

						const private = data.match(/0x.{64}/)[0]
						const public = data.match(/0x.{40}/)[0]
						const keys = {
							private,
							public
						}

                        user.configured = true
                        user.dl = dl
						user.insurance = insurance
                        user.keys = keys
						insurance.renewed = new Date()

						updatedData = data.split('\n').filter(line => !(line.match(private) || line.match(public))).join('\n')
                        fs.promises.writeFile(ADDR_PATH, updatedData)
                        return user.save()
					})
					.then(async _user => {
                        let token
                        try {
                            token = getJwtToken({ user: _user._id, address: _user.keys.public })
                        } catch(err) {
                            return res.status(500).json({err: '[new_insurance] check bulwark co'})
                        }

                        const user = getResponsePayload(_user, token)
                        res.json({msg: 'Successfully configured.', user})
                        console.log(`[new_insurance - success] ${userID}`)
                    })
					.catch(err => console.log(err))
		})
		.catch(err => console.log(`[new_insurance mongo-err] ${userID}`) && console.log(err) && res.status(500).json({err: '[mongo-err] check bulwark console.'}))
})

module.exports = router
