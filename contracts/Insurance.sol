pragma solidity >=0.5.0 <0.7.0;


contract Insurance {
    address payable public contractOwner;

    struct InsuranceTaker {
        string name;
        string vehicleNo;
        address insuranceTakerAddress;
        bool policyValid;
        uint256 lastPayment;
        uint256 premiumNo;
        uint256 premiumAmount;
        bool claimed;
    }

    constructor() public {
        //contractOwner will have the address of the account that first deployed the smartContract
        //in our case the appropriate insurance company
        contractOwner = msg.sender;
    }

    address public contractAddress = address(this);

    mapping(address => InsuranceTaker) public insuranceTakers;

    //can be annual, half-yearly, quaterly or monthly
    uint256 public policyPeriod = 365 days;

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

    function signUp(string memory _name, string memory _vehicleNo, uint256 _premiumAmount)
        public
        payable
        returns (uint256)
    {
        //to check if new insurance taker has enough ether in their account
        require(msg.sender.balance > 10 ether, "[SC: signUp] Error: Not enough ether!");
        //setting the structure variables
        InsuranceTaker storage customer = insuranceTakers[msg.sender];
        customer.name = _name;
        customer.vehicleNo = _vehicleNo;
        customer.premiumAmount = _premiumAmount;
        customer.insuranceTakerAddress = msg.sender;
        customer.premiumNo = 1;
        
        //first premium to be paid upfront
        //require(msg.value == 0.01 ether,"err1");
        //contractOwner.transfer(getPremium());
        require(payPremium(msg.sender), "[SC: signUp] Error: Need to pay first premium upfront.");
        return (200);
    }

    //calculates and returns the premium to be paid by the insurance taker
    function getPremium(address insuranceTaker) public view returns (uint256) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        //premiumAmount = 1 ether;
        return customer.premiumAmount;
    }

    //to check if a insurance taker is currently insured
    function isInsured(address insuranceTaker) public view returns (bool) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        return (customer.policyValid &&
            (customer.lastPayment + policyPeriod >= now));
    }

    function payPremium(address insuranceTaker) public payable returns (bool) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        if (customer.premiumNo == 1) {
            require(msg.value == getPremium(insuranceTaker), "[SC: payPremium] Error: Value is not equal to premium amount.");
            customer.policyValid = true;
            customer.lastPayment = now;
            customer.claimed = false;
            customer.premiumNo++;
        } else {
            require(isInsured(insuranceTaker), "[SC: payPremium] Error: Customer is not insured yet.");
            require(msg.value == getPremium(insuranceTaker), "[SC: payPremium] Error: Value is not equal to premium amount.");
            customer.policyValid = true;
            customer.lastPayment = now;
        }
        return true;
    }

    uint256 public damageAmount;

    //claim function
    function claim() public payable {
        require(
            contractAddress.balance >= 2e18,
            "[SC: claim] Error: Minimum 2 ether required in the contract to refund."
        );
        require(isInsured(msg.sender),"[SC: claim] Error: Sorry, signup for the policy first!");
        InsuranceTaker storage customer = insuranceTakers[msg.sender];
        customer.claimed = true;
        damageAmount = (customer.premiumAmount);
        msg.sender.transfer(damageAmount);
    }
}
