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
    uint256 public constant HTKN_PER_USD = 10;

    // Struct
    struct Ledger {
        uint datetime;
        string currency;
        uint quantity;
        uint usdRate;
        uint discount;
        uint tokenQuantity;
    }

    struct Whitelist {
        address buyer;
        uint exists;
    }

    // Properties
    uint256 public tokenSold;
    bool    public pause = true;
    uint256 public minimumPurchase;
    bool    public saleFinished = false;
    uint256 public minimumSold;
    uint256 public totalUSDAmount;
    Whitelist[] public whiteListInfo;

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
    event Burn(address indexed burner, uint256 value);

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

    modifier onlySaleIsNotFinished() {
        require(!saleFinished);
        _;
    }

    function HotokenReservation() public {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;

        tokenSold = 0;
        discountRate = DiscountRate.SIXTY_FIVE;

        usdRateMap["ETH"] = 4 * (10 ** uint(2));
        usdRateMap["USD"] = 1;
        usdRateMap["BTC"] = 11 * (10 ** uint(3));

        minimumPurchase = 3 * (10 ** uint(2));
        minimumSold = 2 * (10 ** uint(6));

        totalUSDAmount = 0;
    }

    // fallback function can be used to buy tokens
    function () external payable onlyWhenPauseDisabled {
        buyTokens(msg.sender);
    }

    function buyTokens(address beneficiary) public payable onlyWhenPauseDisabled {
        uint256 weiAmount = msg.value;
        uint256 usdRate = usdRateMap["ETH"];

        // calculate token amount to be created problem
        uint256 usdAmount = weiAmount.mul(usdRate).div(10 ** uint256(decimals));
        uint256 tokens = weiAmount.mul(calculateRate("ETH")).div(10 ** uint(2));
        bool exists = ledgerMap[msg.sender].length > 0;

        // check tokens more than supply or not
        uint256 exceedSupply = tokenSold.add(tokens);

        require(beneficiary != address(0));
        require(owner != beneficiary);
        require(whitelist[beneficiary] == 1);

        if ((minimumPurchase <= usdAmount) || exists) {
            require(exceedSupply <= INITIAL_SUPPLY);
            // update state
            tokenSold = tokenSold.add(tokens);

            // transfer token to purchaser
            uint currentBalance = balances[beneficiary];
            balances[beneficiary] = currentBalance.add(tokens);

            // decrease balance of owner
            balances[owner] = balances[owner].sub(tokens);

            totalUSDAmount = totalUSDAmount.add(usdAmount);

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
        whiteListInfo.push(Whitelist(_newAddress, 1));
    }

    function addManyToWhitelist(address[] _newAddresses) public onlyOwner {
        for (uint i = 0; i < _newAddresses.length; i++) {
            whitelist[_newAddresses[i]] = 1;
            whiteListInfo.push(Whitelist(_newAddresses[i], 1));
        }
    }

    function removeFromWhiteList(address _address) public onlyOwner {
        whitelist[_address] = 0;

        for(uint i = 0; i < whiteListInfo.length; i++) {
            if (whiteListInfo[i].buyer == _address) {
                 whiteListInfo[i].exists = 0;
            }
        }
    }

    function removeManyFromWhitelist(address[] _addresses) public onlyOwner {
        for (uint i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = 0;

            for(uint j = 0; j < whiteListInfo.length; j++) {
                if (whiteListInfo[j].buyer == _addresses[i]) {
                    whiteListInfo[j].exists = 0;
                }
            }
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
    * @param _tokens amount of tokens [need to be in wei amount (with multiply by 10 pow 18)]
    */
    function addToLedger(address _address, string _currency, uint _amount, uint _tokens) public onlyOwner {
        // need to check amount in case that currency is not ETH
        // check tokens more than supply or not
        uint256 tokens = _tokens.mul(10 ** uint(decimals));
        uint256 exceedSupply = tokenSold.add(tokens);

        require(_address != owner);
        require(whitelist[_address] == 1);
        require(usdRateMap[_currency] > 0);
        require(exceedSupply <= totalSupply);

        uint256 usdRate = usdRateMap[_currency];

        uint _currentTime = now;
        uint _usdRate = usdRateMap[_currency];
        uint _discount = getDiscountRate();

        tokenSold = tokenSold.add(tokens);
        balances[msg.sender] = balances[msg.sender].sub(tokens);

        ledgerMap[_address].push(Ledger(_currentTime, _currency, _amount, _usdRate, _discount, tokens));
    }

    function addToLedgerAfterSell(address _address, string _currency, uint _amount, uint _tokens) internal {
        // need to check amount in case that currency is not ETH
        require(_address != owner);
        require(usdRateMap[_currency] > 0);
        uint _currentTime = now;
        uint _usdRate = usdRateMap[_currency];
        uint _discount = getDiscountRate();

        ledgerMap[_address].push(Ledger(_currentTime, _currency, _amount.div(10 ** uint(decimals)), _usdRate, _discount, _tokens));
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

        return _discountRate.add(10 ** uint(2)).mul(HTKN_PER_USD).mul(usdRate);
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

    mapping(string=>uint) conversionRateMap;

    /**
    * To set conversion rate from supported currencies to $e-18
    * @param _currency eg. ["ETH", "BTC", "Cent"] (string)
    * @param _rate conversion rate in cent; how many cent for 1 currency unit (int)
    */
    function setConversionRate(string _currency, uint _rate) public onlyOwner {
        conversionRateMap[_currency] = _rate;
    }

    function getConversionRate(string _currency) public view returns (uint) {
        return conversionRateMap[_currency];
    }

    function weiToUsd(uint _wei) public view returns (uint) {
      uint rateInCents = getConversionRate("ETH");
      return _wei.mul(rateInCents).mul(10 ** uint(decimals-2)).div(10 ** uint(decimals));
    }

    function btcToUsd(uint _btc) public view returns (uint) {
      uint rateInCents = getConversionRate("BTC");
      return _btc.mul(rateInCents).mul(10 ** uint(decimals-2)).div(10 ** uint(decimals));
    }

    function usdToTokens(uint _usd) public view returns (uint) {
      return _usd.mul(10);
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
    function claimTokens(string _address) public onlyWhenPauseDisabled {
        require(saleFinished);
        // reach the minimumSold
        // require(tokenSold >= minimumSold);
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

    /**
    * Get the list of all claimTokens
    */
    // function getListOfClaimTokens() public view onlyOwner returns (string) {
    //     var ledgerCSV = new strings.slice[]();

        // add header for csv
        // var headers = new strings.slice[](2);
        // headers[0] = "eth_address".toSlice();
        // headers[1] = "htkn_address".toSlice();
        // ledgerCSV[0] = ",".toSlice().join(headers).toSlice();

        // for (uint i = 0; i < ledgerMap[_address].length; i++) {
        //     var parts = new strings.slice[](6);
        //     Ledger ledger = ledgerMap[_address][i];
        //     parts[0] = strings.uintToBytes(ledger.datetime).toSliceB32();
        //     parts[1] = ledger.currency.toSlice();
        //     parts[2] = strings.uintToBytes(ledger.quantity).toSliceB32();
        //     parts[3] = strings.uintToBytes(ledger.usdRate).toSliceB32();
        //     parts[4] = strings.uintToBytes(ledger.discount).toSliceB32();
        //     parts[5] = strings.uintToBytes(ledger.tokenQuantity).toSliceB32();
        //     ledgerCSV[i + 1] = ",".toSlice().join(parts).toSlice();
        // }

    //     return "\n".toSlice().join(ledgerCSV);
    // }

    function transfer(address _to, uint256 _value) public onlyOwner validDestination(_to) returns (bool) {
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public onlyOwner validDestination(_to) returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    /**
    * Set the minimum sold in usd currency.
    * @param _minimumSold minimumSold
    */
    function setMinimumSold(uint _minimumSold) public onlyOwner {
        minimumSold = _minimumSold;
    }

    function getMinimumSold() external view returns (uint) {
        return minimumSold;
    }

    /**
    * Set the sale finish flag
    * @param _saleFinished sale finished
    */
    function setSaleFinished(bool _saleFinished) public onlyOwner {
        saleFinished = _saleFinished;
    }

    function getSaleFinished() external view returns (bool) {
        return saleFinished;
    }

    /**
    * @dev Burns a specific amount of tokens.
    */
    function burn() public onlyOwner {
        require(saleFinished);
        uint valueToBurn = totalSupply.sub(tokenSold);

        address burner = msg.sender;
        balances[burner] = balances[burner].sub(valueToBurn);
        totalSupply = totalSupply.sub(valueToBurn);
        Burn(burner, valueToBurn);
    }

    // Kill the contract
    function kill() public onlyOwner {
        selfdestruct(owner);
    }
}
