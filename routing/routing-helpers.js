
const jwt = require('jsonwebtoken')

const {	getAccountBalance } = require('../web3/bulwark-core.js')
const SECRET_KEY = require('../config/keys').SECRET_KEY

// expires in 50 weeks
const getJwtToken = payload =>
    new Promise(function(resolve, reject) {
        jwt.sign(payload, SECRET_KEY, {expiresIn: 30240000000}, (err, token) => {
            if(err) reject(err)
            else resolve(token)
        })
    })

const getPremiumPrice = (vehicles, insurancePeriod) => vehicles.reduce((total, wheels) => (total + parseInt(insurancePeriod*0.25) + parseInt(wheels)), 0)

const getResponsePayload = async (user, token) => {
    const temp = {...user._doc}
    delete temp._id
    delete temp.password

    temp.id = user._id
    temp.token = 'Bearer ' + token

    if(temp.configured && !temp.insurance.insured)
        temp.payPremium = getPremiumPrice([temp.insurance.vehicle.wheels], temp.insurance.period)

    try {
        if(temp.configured && temp.insurance.insured)
            temp.wallet.credits = parseFloat(await getAccountBalance(temp.keys.public))
    } catch(err) {
        console.log('Could not fetch credits.')
        console.log(err)
    }

    return temp
}

module.exports = {
    getJwtToken,
    getPremiumPrice,
    getResponsePayload
}