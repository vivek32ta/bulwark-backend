
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
    configured: {
        type: Boolean,
        default: false
    },
    insurance: {
        type: {
            type: String
        },
        renewed: {
            type: Date
        },
        period: {
            type: Number
        },
        vehicle: {
            number: String
        }
    },
    keys: {
        private: {
            type: String,
        },
        public: {
            type: String,
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
