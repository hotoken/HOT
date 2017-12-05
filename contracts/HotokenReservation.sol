pragma solidity ^0.4.17;

import './token/StandardToken.sol';
import './ownership/Ownable.sol';
import './math/SafeMath.sol';
import './utils/strings.sol';

contract HotokenReservation is StandardToken, Ownable {
    
    using SafeMath for uint256;
    using strings for *;

    // Constants
    string public constant name = "ReservedHotoken";
    string public constant symbol = "RHTKN";
    uint8 public constant decimals = 18;
    uint256 public constant INITIAL_SUPPLY = 3000000000 * (10 ** uint256(decimals));
    uint256 public constant HTKN_PER_ETH = 10;

    // Properties
    uint256 public tokenSold;
    bool    public pause = true;
    uint256 public minimumPurchase;

    // Struct
    struct Ledger {
        uint datetime;
        string currency;
        uint quantity;
        uint usdRate;
        uint discount;
        uint tokenQuantity;
    }

    // Enum
    enum DiscountRate {ZERO, TWENTY_FIVE, FOURTY_FIVE, SIXTY_FIVE}
    DiscountRate discountRate;

    // Mapping
    mapping(address=>uint) public whitelist;
    mapping(address=>Ledger[]) public ledgerMap;
    mapping(address=>string) claimTokenMap;
    mapping(string=>uint) usdRateMap;

    // Events
    /**
    * event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param beneficiary who got the tokens
    * @param value weis paid for purchase
    * @param amount amount of tokens purchased
    */
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    // Modifiers
    modifier validDestination(address _to) {
        require(_to != address(0x0));
        require(_to != owner);
        _;
    }

    modifier onlyWhenPauseDisabled() {
        require(!pause);
        _;
    }
    
    function HotokenReservation() public {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;

        tokenSold = 0;
        discountRate = DiscountRate.ZERO;

        usdRateMap["ETH"] = 4 * (10 ** uint(2));
        usdRateMap["USD"] = 1;
        usdRateMap["BTC"] = 11 * (10 ** uint(3));

        minimumPurchase = 5 * (10 ** uint(4));
    }

    // fallback function can be used to buy tokens
    function () external payable onlyWhenPauseDisabled {
        buyTokens(msg.sender);
    }

    function buyTokens(address beneficiary) public payable onlyWhenPauseDisabled {
        uint256 weiAmount = msg.value;
        uint256 usdRate = usdRateMap["ETH"];

        // calculate token amount to be created
        uint256 usdAmount = weiAmount.mul(usdRate).div(10 ** uint256(decimals));
        uint256 tokens = weiAmount.mul(calculateRate("ETH")).div(10 ** uint(2));
        bool exists = ledgerMap[msg.sender].length > 0;

        // check tokens more than supply or not
        uint256 exceedSupply = tokenSold.add(tokens);

        require(beneficiary != address(0));
        require(owner != beneficiary);
        require(whitelist[beneficiary] == 1);
        
        if ((minimumPurchase <= usdAmount) || exists) {
            require(exceedSupply <= totalSupply);
            // update state
            tokenSold = tokenSold.add(tokens);

            // transfer token to purchaser
            uint currentBalance = balances[beneficiary];
            balances[beneficiary] = currentBalance.add(tokens);

            owner.transfer(weiAmount);
            TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);
            addToLedgerAfterSell(beneficiary, "ETH", weiAmount, tokens);
        } else {
            revert();
        }
    }

    function getTokenSold() external view returns (uint) {
        return tokenSold;
    }

    // Whitelist manipulate function
    function addToWhitelist(address _newAddress) public onlyOwner {
        whitelist[_newAddress] = 1;
    }

    function addManyToWhitelist(address[] _newAddresses) public onlyOwner {
        for (uint i = 0; i < _newAddresses.length; i++) {
            whitelist[_newAddresses[i]] = 1;
        }
    }

    function removeFromWhiteList(address _address) public onlyOwner {
        whitelist[_address] = 0;
    }

    function removeManyFromWhitelist(address[] _addresses) public onlyOwner {
        for (uint i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = 0;
        }
    }

    function existsInWhitelist(address _address) external view returns (uint) {
        return whitelist[_address];
    }

    /**
    * add information of buyer to ledger
    * @param _address address of buyer
    * @param _currency currency that buyer spent
    * @param _amount amount of the currency
    * @param _tokens amount of tokens
    */
    function addToLedger(address _address, string _currency, uint _amount, uint _tokens) public onlyOwner {
        // need to check amount in case that currency is not ETH
        require(_address != owner);
        require(usdRateMap[_currency] > 0);
        uint _currentTime = now;
        uint _usdRate = usdRateMap[_currency];
        uint _discount = getDiscountRate();

        ledgerMap[_address].push(Ledger(_currentTime, _currency, _amount, _usdRate, _discount, _tokens));
    }

    function addToLedgerAfterSell(address _address, string _currency, uint _amount, uint _tokens) internal {
        // need to check amount in case that currency is not ETH
        require(_address != owner);
        require(usdRateMap[_currency] > 0);
        uint _currentTime = now;
        uint _usdRate = usdRateMap[_currency];
        uint _discount = getDiscountRate();

        ledgerMap[_address].push(Ledger(_currentTime, _currency, _amount, _usdRate, _discount, _tokens));
    }

    function existsInLedger(address _address) public view returns (bool) {
        return ledgerMap[_address].length > 0;
    }

    function getLedgerInformation(address _address) public view onlyOwner returns (string) {
        require(existsInLedger(_address));
        var ledgerCSV = new strings.slice[](ledgerMap[_address].length + uint(1));

        // add header for csv
        var headers = new strings.slice[](6);
        headers[0] = "datetime".toSlice();
        headers[1] = "currency".toSlice();
        headers[2] = "currency_quantity".toSlice();
        headers[3] = "usd_rate".toSlice();
        headers[4] = "discount_rate".toSlice();
        headers[5] = "token_quantity".toSlice();
        ledgerCSV[0] = ",".toSlice().join(headers).toSlice();
        
        for (uint i = 0; i < ledgerMap[_address].length; i++) {
            var parts = new strings.slice[](6);    
            Ledger ledger = ledgerMap[_address][i];
            parts[0] = strings.uintToBytes(ledger.datetime).toSliceB32();
            parts[1] = ledger.currency.toSlice();
            parts[2] = strings.uintToBytes(ledger.quantity).toSliceB32();
            parts[3] = strings.uintToBytes(ledger.usdRate).toSliceB32();
            parts[4] = strings.uintToBytes(ledger.discount).toSliceB32();
            parts[5] = strings.uintToBytes(ledger.tokenQuantity).toSliceB32();
            ledgerCSV[i + 1] = ",".toSlice().join(parts).toSlice();
        }

        return "\n".toSlice().join(ledgerCSV);
    }


    /**
    * set pause state for preventing sale from buyers
    * @param _pause boolean
    */
    function setPause(bool _pause) public onlyOwner {
        pause = _pause;
    }

    function isPause() external view returns (bool) {
        return pause;
    }

    /**
    * set discount rate via contract owner
    * @param _rate discount rate [0, 1, 2, 3]
    */
    function setDiscountRate(uint _rate) public onlyOwner {
        require(uint(DiscountRate.SIXTY_FIVE) >= _rate);
        discountRate = DiscountRate(_rate);
    }

    function getDiscountRate() public view returns (uint) {
        uint256 _discountRate = uint(discountRate);
        if (_discountRate == 0) {
            return _discountRate;
        }
        return _discountRate.mul(uint(20)).add(uint(5));
    }

    function calculateRate(string _currency) internal view returns (uint) {
        uint _discountRate = getDiscountRate();
        uint usdRate = usdRateMap[_currency];

        return _discountRate.add(10 ** uint(2)).mul(HTKN_PER_ETH).mul(usdRate);
    }


    /**
    * To set current usd rate
    * @param _currency eg. ["ETH", "BTC", "USD"] (string)
    * @param _rate rate for currency to usd (int)
    */
    function setUSDRate(string _currency, uint _rate) public onlyOwner {
        usdRateMap[_currency] = _rate;
    }

    function getUSDRate(string _currency) external view returns (uint) {
        require(usdRateMap[_currency] > 0);
        return usdRateMap[_currency];
    }

    /**
    * To set minimum purchase
    * @param _minimum in usd (int)
    */
    function setMinimumPurchase(uint _minimum) public onlyOwner {
        minimumPurchase = _minimum;
    }

    function getMinimumPurchase() external view returns (uint) {
        return minimumPurchase;
    }

    /**
    * Claim Tokens
    * @param _address address for sending token to
    */
    function claimTokens(string _address) public {
        require(msg.sender != owner);
        require(whitelist[msg.sender] == 1);
        require(ledgerMap[msg.sender].length > 0);
        claimTokenMap[msg.sender] = _address;
    }

    function getAddressfromClaimTokens() public view returns (string) {
        return claimTokenMap[msg.sender];
    }

    function alreadyClaimTokens() public view returns (bool) {
        return bytes(claimTokenMap[msg.sender]).length > 0;
    }

    function transfer(address _to, uint256 _value) public onlyOwner validDestination(_to) returns (bool) {
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public onlyOwner validDestination(_to) returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    // Kill the contract
    function kill() public onlyOwner {
        selfdestruct(owner);
    }
}
