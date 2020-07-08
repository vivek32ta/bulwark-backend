const Web3 = require("web3")

web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/80971d4829e9484cb99c2add04abd977'));
web3.eth.net.getNetworkType(function(err, res){
      console.log("Network Type: "+res); //Displaying undefined
});