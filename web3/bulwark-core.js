
const fs = require("fs")
const path = require('path')
const Web3 = require('web3')

const abiFile = path.resolve(__dirname, '..' , 'contracts/Insurance_sol_Insurance.abi')

//Web3 Configuration
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const abi = JSON.parse(fs.readFileSync(abiFile).toString())
const contract = new web3.eth.Contract(abi)

//Update the contract address here.
contract.options.address = "0xbeCb7a5FEa32586F75926376B8826F885E6ad8cc"

const accountCheck = address =>
    new Promise(function(resolve, reject) {
        console.log(`[BULWARK acc_check] ${address}`)
        web3.eth.getAccounts()
            .then(allAccounts => {
                if(allAccounts.includes(address)) {
                    console.log(`[BULWARK acc_check] exists ${address}`)
                    resolve(true)
                } else {
                    console.log(`[BULWARK acc_check] invalid ${address}`)
                    resolve(false)
                }
            })
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

const getPremium = address =>
    new Promise(async function(resolve,reject){
        console.log(`[BULWARK get_premium] ${address}`)
        try{
            if(await accountCheck(address))
                contract.methods.getPremium(address)
                    .call()
                    .then(getPremium => resolve(getPremium))
                    .catch(err => reject(err))
            else reject({err: `${address} is invalid.`})
        } catch(err) {
            reject(err)
        }
    })

const signUp = user =>
    new Promise(async function(resolve, reject) {
        const {address, userID, vehicleNo, amount} = user
        console.log(`[BULWARK sign_up] ${address}`)
        try {
            if(await accountCheck(address))
                contract.methods.signUp(userID, vehicleNo, web3.utils.toWei(`${amount}`,'ether'))
                    .send({ from: address
                        ,   value: web3.utils.toWei(`${amount}`, 'ether')
                        ,   gas: 210000 })
                    .then(receipt => {
                        console.log(`[BULWARK sign_up] success ${address}`)
                        resolve(receipt)
                    })
                    .catch(err => {
                        console.log(`[BULWARK sign_up] failed ${address}`)
                        reject(err)
                    })
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
                contract.methods.payPremium(address)
                    .send({ from: address
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
                    .send({from: address})
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
    issueClaim,
    getPremium
}
