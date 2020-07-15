
const mongoose = require('mongoose')
const URI = require('../config/keys.js').mongoURI

const dropCollection = (db, collection) => new Promise((resolve, reject) => {
    db.dropCollection(collection, function(err, result) {
        if(err) resolve(`${collection} already clean.`)
        else resolve(`${collection} was cleaned.`)
    })
})

mongoose
    .connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(async conn => {
        console.log('Connected to mongoDB.\nResetting database.')

        const db = conn.connection
        console.log('Cleaning user data ...')
        console.log(await dropCollection(db, 'users'))
        console.log(await dropCollection(db, 'datas'))
        process.exit(0)
    })
    .catch(err => console.log(err) && process.exit(0))
