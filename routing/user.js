
const bcrypt = require('bcryptjs')
const express = require('express')
const passport = require('passport')
const router = express.Router()

const User = require('../models/User')
const {	getJwtToken
	  , getResponsePayload } = require('./routing-helpers.js')

// routes
router.post('/login', (req, res) => {

	const {email, password} = req.body
	console.log(`[login] ${email}`)

	User.findOne({email})
		.then(_user => {
			if(!_user) res.status(500).json({err: 'User not found.'}) && console.log(`[login - not found] ${email}`)
			else bcrypt.compare(password, _user.password)
					.then(async matched => {
						if(!matched) res.status(500).json({err: 'Wrong password.'}) && console.log(`[login - wrong password] ${email}`)
						else try {
								const payload = { user: _user._id }
								if(_user.configured && _user.insurance.insured) payload.address = _user.keys.public
								const token = await getJwtToken({ user: _user._id })
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

	const {email, password, name} = req.body
	console.log(`[register - new] ${email}`)

	User.findOne({email})
		.then(user => {
			if(user) res.status(500).json({err: 'User already exists.'}) && console.log(`[register - pre-exists] ${email}`)
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
						if(!user) res.json({err: 'Could not save. Try again later.'}) && console.log(`[register - save-err] ${email}`)
						else res.json({msg: 'Successfully registered.'}) && console.log(`[register - success] ${email}`)
					})
					.catch(err => {
						res.status(500).json({err: 'check bulwark console.'})
						console.log(`[register - err] ${email}`)
						console.log(err)
					})
		})
		.catch(err => {
			res.status(500).json({err: '[err] check bulwark console.'})
			console.log(`[register - err] ${email}`)
			console.log(err)
		})
})

router.post('/details', passport.authenticate('jwt', {session: false}), (req, res) => {

    const {userData} = req.body
    const {insurance, dl} = userData
	const userID = req.user.user
    console.log(`[save_details] ${userID}`)

	User.findById(userID)
		.then(user => {
			if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[save_details - not found] ${userID}`)
			else {

				insurance.insured = false
				user.configured = true
				user.dl = dl
				user.insurance = insurance
				
				return user.save()
			}
		})
		.then(async _user => {
			if(!_user) return

			try {
				let token = await getJwtToken({ user: _user._id, address: _user.keys.public })
				const user = await getResponsePayload(_user, token)
				res.json({msg: 'Successfully configured.', user})
				console.log(`[save_details - success] ${userID}`)
			} catch(err) {
				return res.status(500).json({err: 'check bulwark console'})
			}
		})
		.catch(err => {
			res.status(500).json({err: 'check bulwark console.'})
			console.log(`[save_details - err] ${userID}`)
			console.log(err)
		})
})

module.exports = router
