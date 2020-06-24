var axios = require("axios");
var lat=12.9791198
var long=77.5912997


function toUNIX(today) { return (Math.round(today.getTime()/1000)) }
/*
"https://api.openweathermap.org/data/2.5/onecall?"+lat+"&lon="+long+"&exclude=minutely,hourly"+"&appid="+appid
*/


async function getSPI(la, lo, start, end)
{
    var month = parseInt(start.substring(5,7))

    var avgPrcp, normalPrcp;
    var header = {"x-api-key" : "lMdC6EVgqoLQRhElLrvu9TZcEQRlqTgT"}
    
    await axios.get("https://api.meteostat.net/v2/point/daily?lat="+la+"&lon="+lo+"&start="+start+"&end="+end, header)
    .then(res => {
        var allData = res.data.data;
        var sumPrcp=0;
        allData.forEach(ele => { sumPrcp = sumPrcp + ele.prcp;  });
        avgPrcp = (sumPrcp / allData.length)
        console.log("Average Precipitation: "+avgPrcp)


        axios.get("https://api.meteostat.net/v2/point/climate?lat="+la+"&lon="+lo , header)
        .then(res => {
            console.log("Normalised Precipitation: "+res.data.data[month-1].prcp)
            normalPrcp = res.data.data[month-1].prcp;

            var sumsqPrcp, sd;
            allData.forEach(ele => { sumsqPrcp = Math.pow((ele.prcp - avgPrcp),2)  });
            sd = Math.sqrt(sumsqPrcp/allData.length)
            console.log("SD: "+sd);
            spi = (avgPrcp-(normalPrcp/26))/sd
            console.log("Standardized Precipitation Index (SPI):"+spi);
            return spi;
        })
        .catch(err=>{console.log("Prcp Normal:"+err.response.status+" "+err.response.statusText)});
    })
    .catch(err=>{console.log("Prcp Average:"+err.response.status+" "+err.response.statusText)});
}

getSPI(lat,long,"2020-05-20","2020-06-23")

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







