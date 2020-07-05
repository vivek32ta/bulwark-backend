var axios = require("axios");
const express = require('express')
const routing = express.Router()


/*
Route Example: (POST) https://localhost:5000/weather/getSPI/
JSON Body: {
            "lat" : "12.9791198"
            "lon" : "77.5912997"
            "start" : "2020-06-05" YYYY/MM/DD
            "end" : "2020-07-05" }
*/
routing.post('/getSPI',(req,res)=>{
    var {lat, lon, start, end} = req.body;
    console.log("Calculating SPI");

    var month = parseInt(start.substring(5,7));
    var avgPrcp, normalPrcp;
    //var header = {"x-api-key" : "lMdC6EVgqoLQRhElLrvu9TZcEQRlqTgT"}
    axios.get("https://api.meteostat.net/v2/point/daily?lat="+lat+"&lon="+lon+"&start="+start+"&end="+end, {
        headers: {"x-api-key" : "lMdC6EVgqoLQRhElLrvu9TZcEQRlqTgT"}})
    .then(respon => {
        var allData = respon.data.data;
        var sumPrcp=0;
        allData.forEach(ele => { sumPrcp = sumPrcp + ele.prcp;  });
        avgPrcp = (sumPrcp / allData.length)
        //console.log("Average Precipitation: "+avgPrcp)


        axios.get("https://api.meteostat.net/v2/point/climate?lat="+lat+"&lon="+lon , {headers: {"x-api-key" : "lMdC6EVgqoLQRhElLrvu9TZcEQRlqTgT"}})
        .then(response => {
            //console.log("Normalised Precipitation: "+response.data.data[month-1].prcp)
            normalPrcp = response.data.data[month-1].prcp;

            var sumsqPrcp, sd;
            allData.forEach(ele => { sumsqPrcp = Math.pow((ele.prcp - avgPrcp),2)  });
            sd = Math.sqrt(sumsqPrcp/allData.length)
            //console.log("SD: "+sd);
            spi = (avgPrcp-(normalPrcp/26))/sd
            console.log("Standardized Precipitation Index (SPI):"+spi);
            
            var spiClass=-1;
            if(spi>=2) {return 0}
            else if((spi>=1.50) && (spi<2)) {spiClass = 1}
            else if((spi>=1) && (spi<1.5)) {spiClass = 2}
            else if((spi>=-1) && (spi<1)) {spiClass = 3}
            else if((spi>=-1.5) && (spi<-1)) {spiClass = 4}
            else if((spi>=-2) && (spi<-1.5)) {spiClass = 5}
            else if(spi<=-2) {spiClass = 6}
            console.log("SPI Class: "+spiClass);
            res.json({spiClass:spiClass})
        
        
        })
        .catch(err=>{res.json(err); console.log("Prcp Normal:"+err.response.status+" "+err.response.statusText)});
    })
    .catch(err=>{res.json(err); console.log("Prcp Average:"+err.response.status+" "+err.response.statusText)});
})


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

module.exports=routing;

/*
SPI CLASSIFICATION 

[0] Extremely wet   [   >= +2.00  ] 100%
[1] Severely wet    [+1.50 ~ +1.99] 0%    
[2] Moderately wet  [+1.00 ~ +1.49] 0%    
[3] Near Normal     [-0.99 ~ +0.99] 0%
[4] Moderate drought[-1.00 ~ -1.49] 0%
[5] Severe drought  [-2.00 ~ -1.50] 50%
[6] Extreme drought [   <= -2.00  ] 100%

*/






