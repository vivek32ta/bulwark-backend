
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const path = require('path')

const app = express()

// CORS support and body-parser
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// passport authorization
app.use(passport.initialize())
require('./config/passport')(passport)

// connect to database
mongoose.set('useFindAndModify', false)
const URI = require('./config/keys.js').mongoURI
mongoose
  	.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
  	.then(() => console.log('Connected to mongoDB.'))
  	.catch(err => console.log(err))

// routes
const router = require("./routing/routes")
const userRoutes = require("./routing/user")
const insuranceRoutes = require("./routing/insurance")

app.use('/', router)

app.use('/user', userRoutes)
app.use('/insurance', insuranceRoutes)

// interface
app.get('/', (req, res) => {
	app.use(express.static('build/interface'))
	res.sendFile(path.resolve(__dirname, 'build', 'interface','index.html'))
})
  


// listen
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`))