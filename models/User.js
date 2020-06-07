
const mongoose = require('mongoose')

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
    dl: {
        type: String
    },
    configured: {
        type: Boolean,
        default: false
    },
    insurance: {
        vehicle: {
            name: {
                type: String
            },
            wheels: {
                type: Number
            },
            number: {
                type: String
            }
        },
        insured: {
            type: Boolean,
            default: false
        },
        renewed: {
            type: Date
        },
        period: {
            type: Number
        },
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
