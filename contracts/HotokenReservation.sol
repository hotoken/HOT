pragma solidity ^0.4.17;

import '../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol';

contract HotokenReservation is StandardToken {

    string public constant name = "Hotoken";
    string public constant symbol = "HTKN";
    uint8 public constant decimals = 18;

    uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(decimals));

    struct Reservation {
        address owner;
        uint limit;
        uint reserved;
    }

    struct ReservedHotToken {
        address owner;
        uint token;
        uint ethAmount;
    }

    mapping(address=>Reservation) public whitelist;
    mapping(uint=>mapping(address=>ReservedHotToken)) public reservedToken;
    
    function HotokenReservation() public {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

    function () payable {
        require(whitelist[msg.sender].reserved == 1);
        require(whitelist[msg.sender].limit >= msg.value);
        uint amount = msg.value;
        reservedToken[30][msg.sender] = ReservedHotToken(msg.sender, 1000, amount);
    }

    function addToWhitelist(address _newAddress, uint _amount) public {
        whitelist[_newAddress] = Reservation(_newAddress, _amount, 1);
    }

    function addManyToWhitelist(address[] _newAddresses, uint[] _amounts) public {
        for (uint i = 0; i < _newAddresses.length; i++) {
            whitelist[_newAddresses[i]] = Reservation(_newAddresses[i], _amounts[i], 1);
        }
    }

    function getLimitOf(address _address) public view returns(uint) {
        require(whitelist[_address].reserved == 1);
        return whitelist[_address].limit;
    }
}
