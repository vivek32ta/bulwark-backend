
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = {
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    license: {
        type: String,
        required: true
    },
    insurance: [{
        type: {
            type: String
        },
        renewed: {
            type: Date
        },
        expire: {
            type: Date
        },
        vehicle: {
            number: String
        }
    }],
    keys: {
        private: {
            type: String,
            required: true
        },
        public: {
            type: String,
            required: true
        }
    },
    wallet: {
        credits: {
            type: Number,
            default: 100
        }
    }
}

module.exports = User = mongoose.model('users', UserSchema)
