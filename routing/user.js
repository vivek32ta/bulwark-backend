
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const ADDR_PATH = path.resolve(__dirname, '../address-and-keys')

// User schema
const User = require('../models/User')

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
			else res.json({user}) && console.log(`[login - success] ${email}`)
		})
		.catch(err => console.log(`[login - err] ${email}`) && console.log(err) && res.status(500).json({err: 'Issues with DB. Check bulwark console.'}))
})

router.post('/new', (req, res) => {

	let hash, updatedData
	const {email, password, name, license} = req.body

	console.log(`[register - new] ${email}`)

	User.findOne({email})
		.then(user => {
			if(user) res.status(500).json({err: 'User already exists.'}) && console.log(`[register - pre-exist] ${email}`)
			else return bcrypt.genSalt(10)
		})
		.then(salt => bcrypt.hash(password, salt))
		.then(_hash => {
			hash = _hash
			return fs.promises.readFile(ADDR_PATH, 'utf8')
		})
		.then(data => {

			const private = data.match(/0x.{64}/)[0]
			const public = data.match(/0x.{40}/)[0]
			updatedData = data.split('\n').filter(line => !(line.match(private) || line.match(public))).join('\n')
			
			return new User({
				email,
				password: hash,
				name,
				license,
				keys: {
					private,
					public
				}
			}).save()
			
		})
		.then(user => {
			if(!user) res.json({err: 'Issues when trying to save user info. Check bulwark console.'}) && console.log(`[register - save-err] ${email}`)
			else return fs.promises.writeFile(ADDR_PATH, updatedData)
		})
		.then(() => res.json({msg: 'Successfully registered.'}) && console.log(`[register - success] ${email}`))
		.catch(err => console.log(`[register - err] ${email}`) && console.log(err) && res.status(500).json({err: 'Issues with database. Check bulwark console.'}))
})

module.exports = router
