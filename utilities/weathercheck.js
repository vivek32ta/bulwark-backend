var axios = require("axios");
const express = require('express')
const routing = express.Router()

/* Routing Example: (POST) https://localhost:5000/weather/tenDays
JSON Body: {
    "lat": "12.9791198",
    "lon": "77.5912997"
}
*/
routing.post('/tenDays',(req,res)=>{
    var appid = "02754bca9d6b7e48e4dced47d096e5b7";
    var {lat, lon} = req.body;

    console.log("Weather forecast for the next 10 days")
    axios.get("https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=minutely,hourly&appid="+appid)
    .then(response=>{
        res.json(response.data)
    }).catch(err=>{console.log(err)})
})



module.exports= routing;





