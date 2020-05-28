# Bulwark Backend
[Contributors](#developed-by)
## REST Enpoints

#### Creating a New Policy: 
Request Body (JSON): 
```bash
[POST] /signUp/<Account Address>

{"customerName":<Customer Name>, "vehicleNo":<Vehicle Number>}
````

#### Checking Account Balance: 
`[GET] /getAccountBalance/<Account Address>`

#### Is Account Insured: 
`[GET] /isInsured/<Account Address>`

#### Pay Premium: 
`[GET] /payPremium/<Account Address>`

#### Claim Policy: 
`[GET] /claim/<Account Address>`






## Setup
* [Linux](#Linux)
* [Windows](#Windows)


### Linux

Use the package manager npm to install all packages and start the blockchain.

```bash
npm install

npm run bulwark:start
```
The server will run at port 5000. Give it a spin using a REST Client.

### Windows
Use `npm install` to install all packages.

Fire up Ganache.

Run `
node initialize-chain.js` and copy the contract address (i.e., the one after the 10 address array) printed on the console. (*This will create a contract.*)


Go to `./routes/routing.js ` and paste the contract address.

`node app.js` will start the server at [http://localhost:5000](http://localhost:5000).

Open a REST Client and give it a spin.

### Developed By
* [Kashif M](https://github.com/kashif-m)
* [Sohini Sahukar](https://github.com/sohinisahukar)
* [Vivek T A](https://github.com/vivek32ta)
* M S Nikhil