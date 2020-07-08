var axios = require("axios");

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

const calculateSPI = data => {
    return new Promise(async function(resolve, reject) {
        console.log("Calculating SPI");
        
        const {lat, lon, start, end} = data
        var month = parseInt(start.substring(5,7));
        var avgPrcp, normalPrcp;
        var spiClass;
        await axios.get("https://api.meteostat.net/v2/point/daily?lat="+lat+"&lon="+lon+"&start="+start+"&end="+end, {
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
                    //console.log("Standardized Precipitation Index (SPI):"+spi);
            
                    spiClass=-1;
                    if(spi>=2) { return 0}
                    else if((spi>=1.50) && (spi<2)) {spiClass = 1}
                    else if((spi>=1) && (spi<1.5)) {spiClass = 2}
                    else if((spi>=-1) && (spi<1)) {spiClass = 3}
                    else if((spi>=-1.5) && (spi<-1)) {spiClass = 4}
                    else if((spi>=-2) && (spi<-1.5)) {spiClass = 5}
                    else if(spi<=-2) {spiClass = 6}
                    else {spiClass=-1}
                    console.log("SPI Class: "+spiClass);
                    return spiClass;
            })
        .then((index) => {resolve(index)})
        .catch(err=>{reject(err); console.log("Prcp Normal:"+err.response.status+" "+err.response.statusText)});
        })
    .catch(err=>{reject(err); console.log("Prcp Average:"+err.response.status+" "+err.response.statusText)});
    })
}

module.exports = {calculateSPI}

