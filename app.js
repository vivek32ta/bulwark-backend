
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require("express")

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// routes
const router = require("./routing/routes")
const userRoutes = require("./routing/user")

app.use('/', router)
app.use('/user', userRoutes)


// listen
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`))