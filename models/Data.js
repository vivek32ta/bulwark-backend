
const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const DataSchema = {
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    claims: [{
        land: {
            type: String
        },
        cause: {
            type: String
        },
        date: {
            type: Date,
            default: new Date()
        },
        info: {
            type: Object
        },
        processed: {
            type: Boolean
        }
    }]
}

module.exports = User = mongoose.model('data', DataSchema)
