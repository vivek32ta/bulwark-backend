
const bcrypt = require('bcryptjs')
const express = require('express')
const passport = require('passport')
const path = require('path')

const router = express.Router()
const ADDR_PATH = path.resolve(__dirname, '../bulwark-data/address-and-keys')
const User = require('../models/User')
const Data = require('../models/Data')

const {getJwtToken, getResponsePayload} = require('../utilities/util.js')
const {validateLogin, validateSignUp, validateDetails} = require('../utilities/validate.js')

// routes
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
	const userID = req.user.user
	console.log(`[user-check] ${userID}`)

	User.findById(userID)
		.then(async (_user) => {
			if(!_user) res.status(500).json({err: 'User not found.'}) && console.log(`[user-check] not found ${email}`)
			else try {
				const payload = { user: _user._id }
				if(_user.configured && _user.insurance.insured) payload.address = _user.keys.public
				const token = await getJwtToken(payload)
				const user = await getResponsePayload(_user, token)
				res.json({user}) && console.log(`[user-check] success ${user.email}`)
			} catch(err) {
				console.log(err)
				console.log(`[user-check] failed`)
				res.status(400).json({err: 'Check bulwark console'})
			}
		})
		.catch(err => {
			console.log(err)
			console.log(`[user-check] mongoerr ${userID}`)
			res.status(400).json({err: 'Check bulwark console'})
		})
})

router.post('/login', (req, res) => {

	const payload = req.body.user
	const {isLegit, err, msg} = validateLogin(payload)
	if(!isLegit) return res.status(500).json({msg: msg, err})


	const {email, password} = payload
	console.log(`[login] ${email}`)

	User.findOne({email})
		.then(_user => {
			if(!_user) res.status(500).json({err: 'User not found.'}) && console.log(`[login - not found] ${email}`)
			else bcrypt.compare(password, _user.password)
					.then(async matched => {
						if(!matched) res.status(500).json({msg: 'Wrong password.'}) && console.log(`[login - wrong password] ${email}`)
						else try {
								const payload = { user: _user._id }
								if(_user.configured && _user.insurance.insured) payload.address = _user.keys.public
								const token = await getJwtToken(payload)
								const user = await getResponsePayload(_user, token)
								res.json({user}) && console.log(`[login - success] ${email}`)
							} catch(err) {
								return res.status(500).json(`[login] - err ${email}`) && console.log(err)
							}
					})
					.catch(err => {
						res.status(500).json({err: '[err] check bulwark console.'})
						console.log(`[login - err] ${email}`)
						console.log(err)
					})
		})
		.catch(err => {
			res.status(500).json({err: '[err] check bulwark console.'})
			console.log(`[login - err] ${email}`)
			console.log(err)
		})
})

router.post('/new', (req, res) => {

	const payload = req.body.user
	const {isLegit, err, msg} = validateSignUp(payload)
	if(!isLegit) return res.status(500).json({msg, err})


	const {email, password, name}  = payload
	console.log(`[register - new] ${email}`)

	User.findOne({email})
		.then(user => {
			if(user) res.status(500).json({msg: 'User already exists.'}) && console.log(`[register - pre-exists] ${email}`)
			else bcrypt.genSalt(10)
					.then(salt => bcrypt.hash(password, salt))
					.then(hash =>
						new User({
							email,
							password: hash,
							name
						}).save()
					)
					.then(user => {
						if(!user) res.json({msg: 'Could not save. Try again later.'}) && console.log(`[register - save-err] ${email}`)
						else {
							new Data({ user: user._id })
								.save()
								.then(account => res.json({msg: 'Successfully registered.'}) && console.log(`[register - success] ${email}`))
								.catch(err => console.log(err))
						}
					})
					.catch(err => {
						res.status(500).json({msg: 'check bulwark console.'})
						console.log(`[register - err] ${email}`)
						console.log(err)
					})
		})
		.catch(err => {
			res.status(500).json({msg: 'check bulwark console.'})
			console.log(`[register - err] ${email}`)
			console.log(err)
		})
})

router.post('/details', passport.authenticate('jwt', {session: false}), (req, res) => {

	const payload = req.body.insurance
	const {isLegit, err, msg} = validateDetails(payload)
	if(!isLegit) return res.status(500).json({msg, err})


	const insurance = payload
	const userID = req.user.user
	console.log(`[save_details] ${userID}`)

	User.findById(userID)
		.then(user => {
			if(!user) res.status(500).json({msg: 'User not found.'}) && console.log(`[save_details - not found] ${userID}`)
			else {

				user.name = insurance.name
				delete insurance.name
				insurance.insured = false
				user.configured = true
				insurance.interval = insurance.interval*30
				user.insurance = insurance

				return user.save()
			}
		})
		.then(async _user => {
			if(!_user) return

			try {
				const payload = { user: _user._id }
				if(_user.configured && _user.insurance.insured) payload.address = _user.keys.public
				let token = await getJwtToken(payload)
				const user = await getResponsePayload(_user, token)
				res.json({msg: 'Successfully configured.', user})
				console.log(`[save_details - success] ${userID}`)
			} catch(err) {
				console.log(`[save_details - err] ${userID}`)
				console.log(err)
				res.status(500).json({err: 'check bulwark console'})
			}
		})
		.catch(err => {
			console.log(`[save_details - err] ${userID}`)
			console.log(err)
			res.status(500).json({msg: 'check bulwark console.'})
		})
})

router.get('/claims', passport.authenticate('jwt', {session: false}), (req, res) => {
	const userID = req.user.user
	console.log(`[get-claims] ${userID}`)

	Data.findOne({user: userID})
		.then(data => {
			if(!data) {
				console.log(`[get-claims] not found`)
				res.status(400).json({msg: 'No data, bro.'})
			}
			else {
				console.log(`[get-claims] done`)
				res.json({claims: data.claims})
			}
		})
		.catch(err => {
			console.log(`[get-claims] err`)
			console.log(err)
		})
})

// Assign dev keys
router.get('/dev:keys', passport.authenticate('jwt', {session: false}), (req, res) => {
	const userID = req.user.user
	console.log(`[dev-keys] new ${userID}`)

	User.findById(userID)
		.then(async user => {
			if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[dev-keys - not found] ${userID}`)
			else fs.promises.readFile(ADDR_PATH, 'utf8')
					.then(async data => {

                        if(data.length === 0) {
                            res.status(500).json({err: 'Accounts full.'})
                            console.log(`[dev-keys] ${userID} - err : address and keys empty`)
                        } else {
                            const private = data.match(/0x.{64}/)[0]
                            const public = data.match(/0x.{40}/)[0]
                            const keys = {
                                private,
								public,
								dev: true
                            }

                            user.keys = keys
                            updatedData = data.split('\n').filter(line => !(line.match(private) || line.match(public))).join('\n')
							fs.promises.writeFile(ADDR_PATH, updatedData)

							return user.save()
                        }
                    })
                    .then(async _user => {

                        try {
                            const token = await getJwtToken({ user: _user._id, address: _user.keys.public })
                            const user = await getResponsePayload(_user, token)
                            res.json({msg: 'Successfully configured.', user})
                            console.log(`[dev-keys - success] ${userID}`)
                        } catch(err) {
                            console.log(`[dev-keys] ${userID} - err`)
                            console.log(err)
                            res.status(500).json({err: 'check bulwark console'})
                        }
                    })
					.catch(err => {
                        res.status(500).json({err: 'check bulwark console.'})
                        console.log(`[dev-keys - err] ${userID}`)
                        console.log(err)
                    })
        })
        .catch(err => {
			res.status(500).json({err: 'check bulwark console.'})
			console.log(`[dev-keys] mongo-err ${userID}`)
			console.log(err)
		})
})

module.exports = router
