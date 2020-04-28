
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.resolve(__dirname, '../db/users')
const ADDR_PATH = path.resolve(__dirname, '../address-and-keys')

router.post('/login', (req, res) => {

	const {email, password} = req.body

	let user

	fs.promises.readFile(DB_PATH, 'utf8')
		.then(data => {

			const re = new RegExp(`${email}---`, 'g')
			user = data.split('\n').filter(line => line.match(re))

			if(user.length === 0)
				return res.status(500).json({err: 'User not found.'})

			user = user[0]
			const hash = user.split('---')[1]
			return bcrypt.compare(password, hash)
		})
		.then(matched => {
			
			if(!matched)
				return res.status(500).json({err: 'Wrong password.'})

			user = user.split('---')
			res.json({user})
		})
		.catch(err => console.log(err) && res.status(500).json({err: 'Issues with DB. Check bulwark console.'}))
})

router.post('/new', (req, res) => {

	const {email, password, name, license} = req.body

	fs.promises.readFile(DB_PATH, 'utf8')
		.then(userData => {

			const re = new RegExp(`${email}---`, 'g')
			if(userData.match(re)) {
				res.status(500).json({err: 'User already exists.'})
				return
			}

			return fs.promises.readFile(ADDR_PATH, 'utf8')			
		})
		.then(addrData => {

			if(!addrData)
				return

			const privateKey = addrData.match(/0x.{64}/)[0]
			const accountAddr = addrData.match(/0x.{40}/)[0]

			bcrypt.genSalt(10)
				.then(salt => bcrypt.hash(password, salt))
				.then(hash => fs.promises.appendFile(DB_PATH, `${email}---${hash}---${name}---${license}---${privateKey}---${accountAddr}\n`))
				.then(() => fs.promises.readFile(ADDR_PATH, 'utf8'))
				.then(data => {
					const newData = data.split('\n').filter(line => !(line.match(privateKey) || line.match(accountAddr))).join('\n')
					return fs.promises.writeFile(ADDR_PATH, newData)
				})
				.then(() => res.json({msg: 'Successfully registered.'}))
		})
		.catch(err => console.log(err) && res.status(500).json({err: 'Issues with database. Check bulwark console.'}))
})

module.exports = router
