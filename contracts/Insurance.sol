pragma solidity >=0.5.0 <0.7.0;


contract Insurance {
    address payable public contractOwner;

    struct InsuranceTaker {
        string aadhar;
        string surveyNo;
        address insuranceTakerAddress;
        bool policyValid;
        uint256 lastPayment;
        uint256 premiumNo;
        uint256 premiumAmount;
        uint256 policyPeriod; //policy period in days

    }

    constructor() public {
        //contractOwner will have the address of the account that first deployed the smartContract
        //In our case the appropriate insurance company
        contractOwner = msg.sender;
    }

    address public contractAddress = address(this);

    mapping(address => InsuranceTaker) public insuranceTakers;

    function pay() external payable {
        if (msg.value == getPremium(msg.sender)) {
            revert("[SC: pay] Error: Pay the correct premium price.");
        }
    }

    function balanceOf() public view returns (uint256) {
        return contractAddress.balance;
    }

    modifier onlyBy() {
        require(
            msg.sender == contractOwner,
            "[SC: onlyBy] Error: Only contract owner can call."
        );
        _;
    }

    function deposit() public payable onlyBy() {
        require(
            msg.value >= 2 ether,
            "[SC: deposit] Eror: Contract needs funds for damage payment."
        );
    }

    function signUp(string memory _aadhar, string memory _surveyNo, uint256 _premiumAmount, uint256 _policyPeriod)
        public
        payable
        returns (uint256)
    {
        //To check if new insurance taker has enough ether in their account
        require(msg.sender.balance > 10 ether, "[SC: signUp] Error: Not enough ether!");
        //Setting the structure variables
        InsuranceTaker storage customer = insuranceTakers[msg.sender];
        customer.aadhar = _aadhar;
        customer.surveyNo = _surveyNo;
        customer.premiumAmount = _premiumAmount;
        customer.insuranceTakerAddress = msg.sender;
        customer.policyPeriod = _policyPeriod * 1 days;
        customer.premiumNo = 1;
        
        //First premium to be paid upfront
        require(payPremium(msg.sender), "[SC: signUp] Error: Need to pay first premium upfront.");
        return (200);
    }

    //Calculates and returns the premium to be paid by the insurance taker
    function getPremium(address insuranceTaker) public view returns (uint256) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        return customer.premiumAmount;
    }

    //To check if a insurance taker is currently insured
    function isInsured(address insuranceTaker) public view returns (bool) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        return (customer.policyValid &&
            (customer.lastPayment + customer.policyPeriod >= now));
    }

    function payPremium(address insuranceTaker) public payable returns (bool) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        if (customer.premiumNo == 1) {
            require(msg.value == getPremium(insuranceTaker), "[SC: payPremium] Error: Value is not equal to premium amount.");
            customer.policyValid = true;
            customer.lastPayment = now;
            customer.premiumNo++;
        } else {
            require(isInsured(insuranceTaker), "[SC: payPremium] Error: Customer is not insured yet.");
            require(msg.value == getPremium(insuranceTaker), "[SC: payPremium] Error: Value is not equal to premium amount.");
            customer.policyValid = true;
            customer.lastPayment = now;
        }
        return true;
    }

    //Claim function
    function claim(uint256 _spi) public payable {
        require(
            contractAddress.balance >= 2e18,
            "[SC: claim] Error: Minimum 2 ether required in the contract to refund."
        );
        require(isInsured(msg.sender),"[SC: claim] Error: Sorry, signup for the policy first!");
        InsuranceTaker storage customer = insuranceTakers[msg.sender];
        if((_spi==0) || (_spi==6))
        {
            //100% of coverage amount (SPI: 0 or 6)
            msg.sender.transfer((customer.premiumAmount*100)/3);
            delete insuranceTakers[msg.sender];
        }
        else if(_spi == 5)
        {
            //50% of coverage amount (SPI: 5)
            msg.sender.transfer((50*((customer.premiumAmount*100)/3))/100);
            delete insuranceTakers[msg.sender];
        }
        else
        {
            //SPI Value normal
            revert("[SC: claim] Error: Catastrophe not detected.");
        }
    }
}
