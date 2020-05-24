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
    }

    constructor() public {
        //contractOwner will have the address of the account that first deployed the smartContract
        //in our case the appropriate insurance company
        contractOwner = msg.sender;
    }

    address public contractAddress = address(this);

    mapping(address => InsuranceTaker) public insuranceTakers;

    //can be annual, half-yearly, quaterly or monthly
    uint256 public policyPeriod = 30 days;

    function pay() external payable {
        if (msg.value == getPremium()) {
            revert("pay the correct premium price");
        }
    }

    function balanceOf() public view returns (uint256) {
        return contractAddress.balance;
    }

    modifier onlyBy() {
        require(
            msg.sender == contractOwner,
            "only contract owner can call this"
        );
        _;
    }

    function deposit() public payable onlyBy() {
        require(
            msg.value >= 2 ether,
            "contract needs funds for damage payment"
        );
    }

    function signUp(string memory _name, string memory _vehicleNo)
        public
        payable
        returns (uint256)
    {
        //to check if new insurance taker has enough ether in their account
        require(msg.sender.balance > 10 ether, "Not enough ether!");
        //setting the structure variables
        InsuranceTaker storage customer = insuranceTakers[msg.sender];
        customer.name = _name;
        customer.vehicleNo = _vehicleNo;
        customer.insuranceTakerAddress = msg.sender;
        customer.premiumNo = 1;
        //first premium to be paid upfront
        //require(msg.value == 0.01 ether,"err1");
        //contractOwner.transfer(getPremium());
        require(payPremium(msg.sender), "need to pay first premium upfront");
        return (200);
    }

    //calculates and returns the premium to be paid by the insurance taker
    function getPremium() internal pure returns (uint256) {
        //insuranceTaker customer = insuranceTakers[insuranceTaker];
        //premiumAmount = 1 ether;
        return 1 ether;
    }

    //to check if a insurance taker is currently insured
    function isInsured(address insuranceTaker) public view returns (bool) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        return (customer.policyValid &&
            (customer.lastPayment + policyPeriod >= now));
    }

    function payPremium(address insuranceTaker) public payable returns (bool) {
        InsuranceTaker storage customer = insuranceTakers[insuranceTaker];
        //require(premiumAmount == getPremium(),"err0");
        if (customer.premiumNo == 1) {
            require(msg.value == getPremium(), "err1");
            customer.policyValid = true;
            customer.lastPayment = now;
            customer.premiumNo++;
        } else {
            require(isInsured(insuranceTaker), "err2");
            require(msg.value == getPremium(), "err3");
            customer.policyValid = true;
            customer.lastPayment = now;
        }
        return true;
    }

    uint256 public damageAmount = 2 ether;

    //claim function
    function claim() public payable {
        require(
            contractAddress.balance >= 2e18,
            "minimum 2 ether required to refund"
        );
        require(isInsured(msg.sender),"sorry signup for the policy first!");
        msg.sender.transfer(damageAmount);
    }
}
