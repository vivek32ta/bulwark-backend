
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// connect to database
// connection to database
mongoose.set('useFindAndModify', false)
const URI = require('./config/keys.js').mongoURI
mongoose
  	.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
  	.then(() => console.log('Connected to mongoDB.'))
  	.catch(err => console.log(err))


// routes
const router = require("./routing/routes")
const userRoutes = require("./routing/user")

app.use('/', router)
app.use('/user', userRoutes)

// interface
app.get('/', (req, res) => {
	app.use(express.static('build/interface'))
	res.sendFile(path.resolve(__dirname, 'build', 'interface','index.html'))
})
  


// listen
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`))