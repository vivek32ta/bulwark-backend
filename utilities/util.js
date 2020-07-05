const axios = require("axios")
const jwt = require('jsonwebtoken')

const {	getAccountBalance } = require('../web3/bulwark-core.js')
const SECRET_KEY = require('../config/keys').SECRET_KEY

const getCurrentPrice = targetCurrency => new Promise(async (resolve, reject) => {
    try {
        const res = await axios.get("https://api.coingecko.com/api/v3/ping")
        axios.get("https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false")
            .then(res => {
                var exchangeRates = res.data.market_data.current_price;
                if(targetCurrency in exchangeRates) resolve(exchangeRates[targetCurrency])
                else reject("Invalid Currency")
            })
            .catch(err => reject(`Too many requests! Try after some time.\n ${err}`))
    } catch(err) {
        console.log(`[Currency Converter] Error: Server is overloaded! \n ${err}`)
        reject(err)
    }
})

const convertCurrency = async (value, currency, targetCurrency) => {

    let res = undefined
    try {
        if(currency.toLowerCase() === 'eth') {
            const marketPrice = await getCurrentPrice(targetCurrency)
            res = value * marketPrice
        } else if(targetCurrency.toLowerCase() === 'eth') {
            const marketPrice = await getCurrentPrice(currency)
            console.log(marketPrice)
            res = value / marketPrice
        } else console.log('[Currency Converter] only for converting from and to ETH.')

    } catch(err) {
        console.log(`[Currency Converter] err ${err}`)
    }

    return res
}

const getPremiumPrice = async (coverage) => {
    const eth = await convertCurrency(coverage, 'inr', 'eth')
    return 0.03 * eth
}

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
        temp.payPremium = await getPremiumPrice(temp.insurance.interval)

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