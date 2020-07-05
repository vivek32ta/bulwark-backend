const axios = require("axios")
const jwt = require('jsonwebtoken')

const {	getAccountBalance } = require('../web3/bulwark-core.js')
const SECRET_KEY = require('../config/keys').SECRET_KEY

const convertCurrency = async (valueInEther, targetCurrency) => {
    await axios.get("https://api.coingecko.com/api/v3/ping")
    .then(response => {
        axios.get("https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false")
        .then(res => {
            var exchangeRates = res.data.market_data.current_price;
            if(targetCurrency in exchangeRates) {
                var result = valueInEther * exchangeRates[targetCurrency]
                console.log(`ETH to ${targetCurrency.toUpperCase()}: ${result}`)
                return result;
            }
            else 
                console.error("[Currency Converter] Error: Invalid Currency")
        })
        .catch(err=>{console.error(`[Currency Converter] Error: Too many requests! Try after some time.\n ${err}`)})
    })
    .catch(err=>{console.error(`[Currency Converter] Error: Server is overloaded! \n ${err}`)})
}

const getPremiumPrice = coverage => coverage * 0.03

// expires in 50 weeks
const getJwtToken = payload =>
    new Promise(function(resolve, reject) {
        jwt.sign(payload, SECRET_KEY, {expiresIn: 30240000000}, (err, token) => {
            if(err) reject(err)
            else resolve(token)
        })
    })

const getResponsePayload = async (user, token) => {
    const temp = {...user._doc}
    delete temp._id
    delete temp.password

    temp.id = user._id
    temp.token = 'Bearer ' + token

    if(temp.configured && !temp.insurance.insured)
        temp.payPremium = getPremiumPrice(temp.insurance.interval)

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
    convertCurrency,
    getPremiumPrice,
    getJwtToken,
    getPremiumPrice,
    getResponsePayload
}