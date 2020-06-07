
const fs = require("fs")
const path = require('path')
const Web3 = require('web3')

const abiFile = path.resolve(__dirname, '..' , 'contracts/Insurance_sol_Insurance.abi')

//Web3 Configuration
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const abi = JSON.parse(fs.readFileSync(abiFile).toString())
const contract = new web3.eth.Contract(abi)

//Update the contract address here.
contract.options.address = "0x59a18d548B986A13c2c1FFdF48e0504b64769b2a"

const accountCheck = address =>
    new Promise(function(resolve, reject) {
        console.log(`[BULWARK acc_check] ${address}`)
        web3.eth.getAccounts()
            .then(allAccounts => allAccounts.includes(address) ? resolve(true) : resolve(false))
            .catch(err => reject(err))
    })

const getAccountBalance = address =>
    new Promise(async function(resolve, reject) {
        console.log(`[BULWARK get_balance] ${address}`)
        try {
            if(await accountCheck(address))
                web3.eth.getBalance(address)
                    .then(bal => resolve(web3.utils.fromWei(bal)))
                    .catch(err => reject(err))
            else reject({err: `${address} is invalid.`})
        } catch(err) {
            reject(err)
        }
    })

const isInsured = address =>
    new Promise(async function(resolve, reject) {
        console.log(`[BULWARK is_insured] ${address}`)
        try {
            if(await accountCheck(address))
                contract.methods.isInsured(address)
                    .call()
                    .then(isInsured => resolve(isInsured))
                    .catch(err => reject(err))
            else reject({err: `${address} is invalid.`})
        } catch(err) {
            reject(err)
        }
    })

const signUp = user =>
    new Promise(async function(resolve, reject) {
        const {address, userID, vehicleNo} = user
        console.log(`[BULWARK sign_up] ${address}`)
        try {
            if(await accountCheck(address))
                contract.methods.signUp(userID, vehicleNo)
                    .send({ from: address
                        ,   value: web3.utils.toWei('1', 'ether')
                        ,   gas: 210000 })
                    .then(receipt => resolve(receipt))
                    .catch(err => reject(err))
            else reject({err: `${address} is invalid.`})
        } catch(err) {
            reject(err)
        }
    })

const payPremium = address =>
    new Promise(async function(resolve, reject) {
        console.log(`[BULWARK pay_premium] ${address}`)
        try {
            if(await accountCheck(address))
                contract.methods.payPremium(accountAddress)
                    .send({ from: accountAddress
                        ,   value: web3.utils.toWei('1','ether') })
                    .then(receipt => resolve(receipt))
                    .catch(err => reject(err))
            else reject({err: `${address} is invalid.`})
        } catch(err) {
            reject(err)
        }
    })

const issueClaim = address =>
    new Promise(async function(resolve, reject) {
        console.log(`[BULWARK claim] ${address}`)
        try {
            if(await accountCheck(address))
                contract.methods.claim()
                    .send({from: accountAddress})
                    .then(receipt => resolve(receipt))
                    .catch(err => reject(err))
            else reject({err: `${address} is invalid.`})
        } catch(err) {

        }
    })

module.exports = {
    accountCheck,
    getAccountBalance,
    isInsured,
    signUp,
    payPremium,
    issueClaim
}
