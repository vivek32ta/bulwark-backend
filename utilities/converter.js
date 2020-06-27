var axios = require("axios");

async function convertCurrency(valueInEther, targetCurrency)
{
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
convertCurrency(2,"inr")