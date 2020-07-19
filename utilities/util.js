const axios = require("axios")
const jwt = require('jsonwebtoken')

const {	getAccountBalance }        = require('../web3/bulwark-core.js')
const {SECRET_KEY, openWeatherMap, mapQuestAPI} = require('../config/keys.js')

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
            res = value / marketPrice
            console.log(res * 0.03)
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

    if(temp.configured)
        temp.payPremium = await getPremiumPrice(temp.insurance.coverage)
    try {
        if(temp.configured && temp.insurance.insured)
            temp.wallet.credits = parseFloat(await getAccountBalance(temp.keys.public))
    } catch(err) {
        console.log('Could not fetch credits.')
        console.log(err)
    }

    return temp
}

const getWeatherForecast = location => new Promise(async (resolve, reject) => {
    try {
        const {lat, lon} = location
        const response   = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${openWeatherMap}`)
        resolve(response.data)
    } catch(err) {
        reject(err)
    }
})

const reverseLocationLookup = location => new Promise(async (resolve, reject) => {
    try {
        const {lat, lon} = location
        const response   = await axios.get(`http://open.mapquestapi.com/geocoding/v1/reverse?key=${mapQuestAPI}&location=${lat},${lon}&includeRoadMetadata=true&includeNearestIntersection=true`)
        resolve(response.data)
    } catch(err) {
        reject(err)
    }
})

module.exports = {
    convertCurrency,
    getCurrentPrice,
    getPremiumPrice,
    getJwtToken,
    getPremiumPrice,
    getResponsePayload,
    getWeatherForecast,
    reverseLocationLookup
}