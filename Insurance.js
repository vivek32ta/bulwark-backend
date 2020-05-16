
const Insurance = artifacts.require('Insurance');

contract('Insurance', function(accounts) {
    let insurance;

    beforeEach(async function () {
        insurance = await Insurance.deployed();
    });

    it('1.should deploy the smart contract properly.', async function () {
        assert(insurance.address !== '');
    });

    it('2.signup with no ether should be unsuccessful', async function () {
        try {
            await insurance.signUp('ava','1001',{from: accounts[1], value: web3.utils.toWei('0','ether')});
        } catch(e) {
            assert(e.message.includes('err1'));
            return;
        }
        assert(false);
    });

    it('3.signup with 1 ether must be successful', async function () {
        
        var insured = await insurance.isInsured(accounts[2]);
        assert.isFalse(insured, 'user should not be insured');

        await insurance.signUp('bob','1002',{from: accounts[2], value: web3.utils.toWei('1','ether')});

        insured = await insurance.isInsured(accounts[2]);
        assert.isTrue(insured, 'user should now be insured');

        let contractBalance = await web3.eth.getBalance(insurance.address);
        assert.equal(contractBalance, 1e+18);
    });

    // it('4.claim without enough ether in SMC must be unsuccessful', async function () {
    //     try {
    //         await insurance.claim(accounts[2]);
    //     } catch(e) {
    //         assert(e.message.includes('minimum 2 ether required to refund'));
    //         return;
    //     }
    //     assert(false);
    // });

    it('5.deposit from non owner account must be unsuccessful', async function () {
        try {
            await insurance.deposit({from: accounts[2], value: web3.utils.toWei('2','ether')});
        } catch(e) {
            assert(e.message.includes('only contract owner can call this'));
            return;
        }
        assert(false);
    });

    it('6.deposit from owner with < 2ether must be unsuccessful', async function () {
        try {
            await insurance.deposit({from: accounts[0], value: web3.utils.toWei('0','ether')});
        } catch(e) {
            assert(e.message.includes('contract needs funds for damage payment'));
            return;
        }
        assert(false);
    });

    it('7.deposit from owner with >= 2ether must be successful', async function () {
        let contractBalanceBefore = await web3.eth.getBalance(insurance.address);

        await insurance.deposit({from: accounts[0], value: web3.utils.toWei('2','ether')});

        let contractBalanceAfter = await web3.eth.getBalance(insurance.address);

        let a = web3.utils.toBN(contractBalanceAfter).toString();
        let c = web3.utils.toBN(contractBalanceBefore).add(web3.utils.toBN(2e18)).toString();
        assert.equal(c, a);

    });

    it('8.accounts that have not signedup must not be insured', async function () {
        var insured = await insurance.isInsured(accounts[4]);
        assert.isFalse(insured, 'user without signup should not be insured');
    });

    it('9.non insured users must not be allowed to pay the premium', async function () {
        try {
            await insurance.payPremium(accounts[5],{from: accounts[5], value: web3.utils.toWei('1','ether')});
        } catch(e) {
            assert(e.message.includes('err2'));
            return;
        }
        assert(false);
    });

    // it('10.non insured users cannot process claims', async function () {
    //     try {
    //         await insurance.claim({from: accounts[4]});
    //     } catch(e) {
    //         assert(e.message.includes('sorry signup for the policy first!'));
    //         return;
    //     }
    //     assert(false);
    // });

    it('11.checking if insured user is still insured', async function () {
        var insured = await insurance.isInsured(accounts[2]);
        assert.isTrue(insured, 'yeah user still insured');
    });

    it('12.paying premium with insured account without proper premium amount must be unsuccessful', async function () {
        try {
            await insurance.payPremium(accounts[2],{from: accounts[2], value: web3.utils.toWei('0.1','ether')});
        } catch(e) {
            assert(e.message.includes('err3'));
            return;
        }
        assert(false);
    });

    it('13.paying premium with insured account with proper premium amount must be successful', async function () {
        let contractBalanceBefore = await web3.eth.getBalance(insurance.address);

        await insurance.payPremium(accounts[2],{from: accounts[2], value: web3.utils.toWei('1','ether')});

        let contractBalanceAfter = await web3.eth.getBalance(insurance.address);

        let a = web3.utils.toBN(contractBalanceAfter).toString();
        let c = web3.utils.toBN(contractBalanceBefore).add(web3.utils.toBN(1e18)).toString();
        assert.equal(c, a);

    });

    // it('14.claim process by insured user must be successful', async function () {
    //     let contractBalanceBefore = await web3.eth.getBalance(insurance.address);
    //     let accountBalanceBefore = await web3.eth.getBalance(accounts[2]);

    //     await insurance.claim({from: accounts[2]});

    //     let contractBalanceAfter = await web3.eth.getBalance(insurance.address);
    //     let accountBalanceAfter = await web3.eth.getBalance(accounts[2]);

    //     let a = web3.utils.toBN(accountBalanceAfter).toString();
    //     let c = web3.utils.toBN(accountBalanceBefore).add(web3.utils.toBN(1e18)).toString();
    //     assert.equal(c, a);

    //     let x = web3.utils.toBN(contractBalanceBefore).toString();
    //     let z = web3.utils.toBN(contractBalanceAfter).add(web3.utils.toBN(1e18)).toString();
    //     assert.equal(z, x);
    // });
});