
const fs   = require("fs")
const path = require('path')
const Web3 = require('web3')

//Web3 Configuration
const abiFile = path.resolve(__dirname, '..' , 'contracts/Insurance_sol_Insurance.abi')

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const abi  = JSON.parse(fs.readFileSync(abiFile).toString())
const contract = new web3.eth.Contract(abi)
contract.options.address = ""

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

const signUp = user =>
    new Promise(async function(resolve, reject) {
        const {address, userID, aadhar, premiumAmount,
                surveyNo, location, interval} = user
        console.log(`[BULWARK sign_up] ${address}`)
        try {
            if(await accountCheck(address))
                contract.methods.signUp(aadhar, surveyNo, location, interval, web3.utils.toWei(`${premiumAmount}`,'ether'))
                    .send({ from: address
                        ,   value: web3.utils.toWei(`${premiumAmount}`, 'ether')
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

module.exports = {
    accountCheck,
    getAccountBalance,
    signUp,
    web3
}
