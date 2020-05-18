
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const path = require('path')

const ADDR_PATH = path.resolve(__dirname, '../address-and-keys')
const SECRET_KEY = require('../config/keys').SECRET_KEY

// User schema
const User = require('../models/User')


// routes
router.post('/login', (req, res) => {

	let user
	const {email, password} = req.body

	console.log(`[login] ${email}`)

	User.findOne({email})
		.then(_user => {
			user = _user
			if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[login - not found] ${email}`)
			else return bcrypt.compare(password, user.password)
		})
		.then(matched => {
			if(!matched) res.status(500).json({err: 'Wrong password.'}) && console.log(`[login - wrong password] ${email}`)
			else {
				const payload = {
					user: user._id
				}
		
				jwt.sign(payload, SECRET_KEY, (err, token) => {
					
					if(err) res.status(500).json({err: '[jwt-err] check bulwark console.'}) && console.log(err)
					else {

						const temp = {
							id: user._id,
							name: user.name,
							configured: user.configured,
							token: 'Bearer ' + token
						}
						res.json({user: temp})
						console.log(`[login - success] ${email}`)
					}
				})
			}
		})
		.catch(err => {
			console.log(`[login - err] ${email}`)
			console.log(err)
			res.status(500).json({err: '[err] check bulwark console.'})
		})
})

router.post('/new', (req, res) => {

	let hash, updatedData
	const {email, password, name, license} = req.body

	console.log(`[register - new] ${email}`)

	User.findOne({email})
		.then(user => {
			if(user) res.status(500).json({err: 'User already exists.'}) && console.log(`[register - pre-exists] ${email}`)
			else return bcrypt.genSalt(10)
		})
		.then(salt => bcrypt.hash(password, salt))
		.then(hash =>
			new User({
				email,
				password: hash,
				name,
				license,
			}).save()
		)
		.then(user => {
			if(!user) res.json({err: '[mongo-err] check bulwark console.'}) && console.log(`[register - save-err] ${email}`)
			else res.json({msg: 'Successfully registered.'}) && console.log(`[register - success] ${email}`)
		})
		.catch(err => {
			console.log(`[register - err] ${email}`)
			console.log(err)
			res.status(500).json({err: '[err] check bulwark console.'})
		})
})

router.post('/configure', passport.authenticate('jwt', {session: false}), (req, res) => {

	const {insurance} = req.body
	const userID = req.user

	console.log(`[configure - new] ${userID}`)

	User.findById(userID)
		.then(user => {
			if(!user) res.status(500).json({err: 'User not found.'}) && console.log(`[configure - not found] ${userID}`)
			else {
				fs.promises.readFile(ADDR_PATH, 'utf8')
					.then(data => {

						const private = data.match(/0x.{64}/)[0]
						const public = data.match(/0x.{40}/)[0]
						const keys = {
							private,
							public
						}
						insurance.renewed = new Date()
						user.configured = true
						user.insurance = insurance
						user.keys = keys

						console.log(user)

						updatedData = data.split('\n').filter(line => !(line.match(private) || line.match(public))).join('\n')
						return fs.promises.writeFile(ADDR_PATH, updatedData)
					})
					.then(() => res.json({msg: 'Successfully configured.'}) && console.log(`[configure - success] ${user.email}`))
					.catch(err => console.log(err))
			}
		})
		.catch(err => console.log(`[configure mongo-err] ${userID}`) && console.log(err) && res.status(500).json({err: '[mongo-err] check bulwark console.'}))
})

module.exports = router
