
const bodyParser = require('body-parser')
const express = require("express")
const app = express()


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// routes
const router = require("./routing/routes")
const userRoutes = require("./routing/user")

app.use('/', router)
app.use('/user', userRoutes)


// listen
PORT = process.env.PORT | 5000
console.log(`Listening on ${PORT}`)
app.listen(PORT)