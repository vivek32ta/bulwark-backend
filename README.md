![](https://github.com/kashif-m/bulwark-frontend/blob/master/src/assets/images/bulwarklogo.svg?raw=true)
# Bulwark Server

> Bulwark is a blockchain based Agricultural Insurance dApp. (de-centralized application)
------------
This repo is a server for the Bulwark [web application](https://github.com/kashif-m/bulwark-frontend).

### REST Enpoints

##### Authentication: 
Use it to get the bearer token and authenticate all the other calls.
```bash
[POST] /user/login/

{"email":<Registered Email>, "password":<Password>}
````

##### Retrieving all transactions for the account: 
`[GET] /bulwark/getTransactions/`

##### Check Insurance status: 
`[GET] /bulwark/isInsured/`

##### Pay Premium: 
`[GET] /bulwark/payPremium/`

##### Claim Policy: 
`[GET] /bulwark/claim/`

##### Get Current Weather: 
`[GET] /bulwark/weather/`

------------



### Setup
* [Docker](#Docker)
* [Linux](#Linux)

##### Docker
* Install [Docker](https://docs.docker.com/get-docker/) for your system.
* Run `docker-compose up`

For WebApp: Setup [bulwark-frontend](https://github.com/kashif-m/bulwark-frontend).
For API Endpoints: Open a REST Client and give it a spin.


##### Linux

Use the package manager npm to install all packages and start the blockchain.

```bash
npm install

npm run bulwark:start
```
The server will run at port 5000. Give it a spin using a REST Client.

------------

### Developers
* [Kashif M](https://github.com/kashif-m)
* [Sohini Sahukar](https://github.com/sohinisahukar)
* [Vivek T A](https://github.com/vivek32ta)
* [M S Nikhil](https://github.com/msnikhil03)
