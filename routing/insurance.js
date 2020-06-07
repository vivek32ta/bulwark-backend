
const express = require('express')
const router = express.Router()
const fs = require('fs')
const passport = require('passport')
const path = require('path')

const ADDR_PATH = path.resolve(__dirname, '../bulwark-data/address-and-keys')
const {getJwtToken, getResponsePayload} = require('./routing-helpers.js')

const {accountCheck, signUp} = require('../web3/bulwark-core.js')

router.post('/new', passport.authenticate('jwt', {session: false}), (req, res) => {

	const userID = req.user.user
    console.log(`[new_insurance] ${userID}`)

	User.findById(userID)
		.then(user => {
			if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[new_insurance - not found] ${userID}`)
			else fs.promises.readFile(ADDR_PATH, 'utf8')
					.then(async data => {

                        if(data.length === 0) {
                            res.status(500).json({err: 'Accounts full.'})
                            console.log(`[new_insurance] ${userID} - err : address and keys empty`)
                        } else {
                            console.log(data)
                            const private = data.match(/0x.{64}/)[0]
                            const public = data.match(/0x.{40}/)[0]
                            const keys = {
                                private,
                                public
                            }
                            
                            user.keys = keys
                            updatedData = data.split('\n').filter(line => !(line.match(private) || line.match(public))).join('\n')
                            fs.promises.writeFile(ADDR_PATH, updatedData)

                            const _data = {
                                userID: user._id.toString(),
                                vehicleNo: user.insurance.vehicle.number,
                                address: user.keys.public
                            }

                            let _res
                            try {
                                _res = await signUp(_data)
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

                        if(!_user) return

                        let token
                        try {
                            token = await getJwtToken({ user: _user._id, address: _user.keys.public })
                        } catch(err) {
                            console.log(`[new_insurance] ${userID} - err`)
                            console.log(err)
                            res.status(500).json({err: 'check bulwark console'})
                        }
                        const user = getResponsePayload(_user, token)
                        res.json({msg: 'Successfully configured.', user})
                        console.log(`[new_insurance - success] ${userID}`)
                    })
					.catch(err => {
                        res.status(500).json({err: 'check bulwark console.'})
                        console.log(`[new_insurance - err] ${userID}`)
                        console.log(err)
                    })
        })
        .catch(err => {
			res.status(500).json({err: 'check bulwark console.'})
			console.log(`[new_insurance - mongo-err] ${userID}`)
			console.log(err)
		})
})

module.exports = router
