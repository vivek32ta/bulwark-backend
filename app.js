
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
const bulwarkRoutes = require("./routing/bulwark")
const insuranceRoutes = require("./routing/insurance")
const userRoutes = require("./routing/user")

app.use('/bulwark', bulwarkRoutes)
app.use('/insurance', insuranceRoutes)
app.use('/user', userRoutes)

// For development and testing
const devRoutes = require('./routing/routes_dev.js')
const { mongoURI } = require('./config/keys')
app.use('/dev', devRoutes)

// interface
app.get('/', (req, res) => {
	app.use(express.static('interface'))
	res.sendFile(path.resolve(__dirname, 'interface','index.html'))
})
  

// listen
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`))