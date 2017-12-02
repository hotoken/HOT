pragma solidity ^0.4.17;

import '../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol';
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract HotokenReservation is StandardToken, Ownable {
    
    string public constant name = "ReservedHotoken";
    string public constant symbol = "RHTKN";
    uint8 public constant decimals = 18;

    uint256 public constant INITIAL_SUPPLY = 3000000000 * (10 ** uint256(decimals));

    struct ReservedHotToken {
        address owner;
        uint token;
        uint ethAmount;
    }

    mapping(address=>uint) public whitelist;
    
    function HotokenReservation() public {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

    function addToWhitelist(address _newAddress) public {
        whitelist[_newAddress] = 1;
    }

    function addManyToWhitelist(address[] _newAddresses) public {
        for (uint i = 0; i < _newAddresses.length; i++) {
            whitelist[_newAddresses[i]] = 1;
        }
    }

    function removeFromWhiteList(address _address) public {
        whitelist[_address] = 0;
    }

    function removeManyFromWhitelist(address[] _addresses) public {
        for (uint i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = 0;
        }
    }
}
