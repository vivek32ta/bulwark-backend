
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
    configured: {
        type: Boolean,
        default: false
    },
    insurance: {
        aadhar: {
            type: String
        },
        surveyNo: {
            type: String
        },
        location: {
            lat: {
                type: Number
            },
            lon: {
                type: Number
            }
        },
        insured: {
            type: Boolean,
            default: false
        },
        interval: {
            type: Number
        },
        amount: {
            type: Number
        },
        date: {
            type: Date
        },
        coverage: {
            type: Number
        }
    },
    keys: {
        private: {
            type: String,
        },
        public: {
            type: String,
        },
        dev: {
            type: Boolean,
            default: false
        }
    },
    wallet: {
        credits: {
            type: Number,
            default: 100
        }
    }
}

module.exports = User = mongoose.model('user', UserSchema)
