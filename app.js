const express = require("express")
const app = express()

const router = require("./routing/routes")
const userRoutes = require("./routing/user")

app.use('/', router)
app.use('/user', userRoutes)

console.log("Listening on 8080")
app.listen(8080)