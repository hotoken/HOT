pragma solidity ^0.4.17;

import '../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol';
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';

contract HotokenReservation is StandardToken, Ownable {
    
    string public constant name = "ReservedHotoken";
    string public constant symbol = "RHTKN";
    uint8 public constant decimals = 18;

    uint256 public constant INITIAL_SUPPLY = 3000000000 * (10 ** uint256(decimals));
    // Fixed rate for now
    uint256 public constant rate = 2 * (10 ** uint256(3));

    uint256 public tokenSold;
    uint256 public weiRaised;

    mapping(address=>uint) public whitelist;

    /**
    * event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param beneficiary who got the tokens
    * @param value weis paid for purchase
    * @param amount amount of tokens purchased
    */
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
    
    function HotokenReservation() public {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
        tokenSold = 0;
        weiRaised = 0;
    }

    // fallback function can be used to buy tokens
    function () external payable {
        buyTokens(msg.sender);
    }

    function buyTokens(address beneficiary) public payable {
        require(beneficiary != address(0));
        require(owner != beneficiary);
        require(whitelist[beneficiary] == 1);
        require(tokenSold <= totalSupply);

        uint256 weiAmount = msg.value;
        // calculate token amount to be created
        uint256 tokens = weiAmount.mul(rate);

        // update state
        tokenSold = tokenSold.add(tokens);
        weiRaised = weiRaised.add(weiAmount);

        // transfer token to purchaser
        uint currentBalance = balances[beneficiary];
        balances[beneficiary] = currentBalance.add(tokens);
        owner.transfer(weiAmount);
        TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);
    }

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
}
