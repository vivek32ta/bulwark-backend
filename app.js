const express = require("express");
const app = express();
const router = require("./routing/routes");

app.use('/',router);

console.log("Listening on 8080")
app.listen(8080);