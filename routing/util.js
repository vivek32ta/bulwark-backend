const express = require('express')
const router = express.Router()
const {getWeatherForecast, reverseLocationLookup} = require('../utilities/util')

router.get('/getWeather', async (req, res) => {
    const {lat, lon} = req.query
    const location = {lat, lon}
    if(!lat || !lon) return res.json({err: 'Pass the correct values.'})
    console.log(`[weather-check] Lat: ${lat}, Lon: ${lon}`)
    try {
        const weatherData = await getWeatherForecast(location)
        const current = weatherData.current
        const info = current.weather[0].description
        const weather = {
            humidity: current.humidity,
            temp: `${(current.temp - 273.15).toFixed(2)} °C`,
            info: info.charAt(0).toUpperCase() + info.slice(1),
        }
        const locationData = await reverseLocationLookup(location)
        weather.location = locationData.results[0].locations[0].street
        res.json({weather})
    } catch(err) {
        console.log(`[weather-check] err`)
        console.log(err)
        res.status(400).json({err: 'Check bulwark console?'})
    }
})

module.exports = router