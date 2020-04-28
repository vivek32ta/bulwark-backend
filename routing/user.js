
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
fs = require('fs')

router.post('/login', (req, res) => {

	fs.readFile('../')
})

router.post('/new', (req, res) => {

	const password = req.body

	console.log(password)
	console.log(req)

	bcrypt.genSalt(10)
		.then(salt => bcrypt.hash(password, salt))
		.then(hash => console.log(hash))
})

module.exports = router
