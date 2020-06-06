
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')

const User = require('../models/User')
const {getJwtToken, getResponsePayload} = require('./routing-helpers.js')

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
						else {
							let token
							try {
								token = await getJwtToken({ user: _user._id })
							} catch(err) {
								return res.status(500).json(`[login] - err ${email}`) && console.log(err)
							}

							const user = getResponsePayload(_user, token)
							res.json({user}) && console.log(`[login - success] ${email}`)
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

module.exports = router
