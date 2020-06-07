
const jwt = require('jsonwebtoken')

const SECRET_KEY = require('../config/keys').SECRET_KEY

const getJwtToken = payload =>
    new Promise(function(resolve, reject) {
        jwt.sign(payload, SECRET_KEY, (err, token) => {
            if(err) reject(err)
            else resolve(token)
        })
    })

const getPremiumPrice = (vehicles, insurancePeriod) => vehicles.reduce((total, wheels) => (total + parseInt(insurancePeriod*0.25) + parseInt(wheels)), 0)

const getResponsePayload = (user, token) => {
    const temp = {...user._doc}
    delete temp._id
    delete temp.password

    temp.id = user._id
    temp.token = 'Bearer ' + token

    if(temp.configured && !temp.insured)
        temp.payPremium = getPremiumPrice([temp.insurance.vehicle.wheels], temp.insurance.period)

    return temp
}

module.exports = {
    getJwtToken,
    getPremiumPrice,
    getResponsePayload
}