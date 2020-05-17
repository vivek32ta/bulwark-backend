
const mongoose = require('mongoose')
const URI = require('../config/keys.js').mongoURI

mongoose
    .connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(conn => {
        console.log('Connected to mongoDB.\nResetting database.')

        const db = conn.connection
        db.dropCollection('users', function(err, result) {
            if(err) console.error('Database already clean.')
            else console.log('Database cleaned.')

            process.exit(0)
        })
    })
    .catch(err => console.log(err) && process.exit(0))
