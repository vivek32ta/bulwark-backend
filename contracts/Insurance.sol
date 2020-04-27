pragma solidity ^0.4.15;

contract Insurance {
    function underwrite() public payable ;

    function update(address insuranceTaker) public;

    function isInsured(address insuranceTaker) public constant returns (bool insured);

    function getPremium(address insuranceTaker) public constant returns (uint256 premium);

    // fallback function accepts premium payment for msg.sender;
    function() public payable {
        payPremiumFor(msg.sender);
    }

    function payPremiumFor(address insuranceTaker) public payable;

    function claim() public payable;
}

contract CarInsurance is Insurance {

    struct InsuranceTaker {
        bool banned;
        bool policyValid;
        uint256 lastPayment;
        uint256 numAccidents;
    }

    mapping(address => InsuranceTaker) public insuranceTakers;

    uint256 public paymentPeriod = 30 days;

    uint256 public premiumPerAccident = 0.1 ether;

    uint256 public damagePayment = 1 ether;

    function underwrite() public payable  {
        InsuranceTaker storage customer = insuranceTakers[msg.sender];

        // do not accept new customers that have been banned previously
        require(!customer.banned);
        // Error: "Customer is banned."

        // in order to underwrite the customer needs to pay the first premium upfront
        require(msg.value == getPremium(msg.sender));
        // Error: "Couldn't pay first premium"
        customer.numAccidents = 0;
        customer.lastPayment = now;
        customer.policyValid = true;
    }

    function update(address insuranceTaker) public {
        // if insurance taker did not pay within required interval they will loose their insurance
        // and will be banned for future insurance policies

        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];

        if (customer.policyValid && customer.lastPayment + paymentPeriod < now) {
            customer.policyValid = false;
            customer.banned = true;
        }
    }

    // checks if an insurance taker is currently insured
    function isInsured(address insuranceTaker) public constant returns (bool insured) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        return customer.policyValid && 
            !customer.banned &&
            customer.lastPayment + paymentPeriod >= now;
    }

    // calculates the premium for an insurance taker
    function getPremium(address insuranceTaker) public constant returns (uint256 premium) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        return (customer.numAccidents + 1) * premiumPerAccident;
    }

    // allows premium to be paid by separate account
    function payPremiumFor(address insuranceTaker) public payable {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];

        // only accept correct amount
        require(msg.value == getPremium(insuranceTaker));
        //Error message: "Incorrect Premium Amount"

        // check if last payment is overdue, if so -> ban
        update(insuranceTaker);

        // only accept payment from valid insurance takers
        require(isInsured(insuranceTaker));
        //Error message: "Customer not yet Insured"

        customer.lastPayment = now;
    }

    function claim() public payable {
        require(isInsured(msg.sender));
        //Error: "Customer not insured"
        InsuranceTaker storage customer = insuranceTakers[msg.sender];
        msg.sender.transfer(damagePayment);
        customer.numAccidents++;
    }

}