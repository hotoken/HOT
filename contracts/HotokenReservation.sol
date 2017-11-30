pragma solidity ^0.4.17;

contract HotokenReservation {

    struct Reservation {
        address owner;
        uint limit;
        uint reserved;
    }

    struct ReservedHotToken {
        address owner;
        uint token;
        uint spent;
    }

    mapping(address=>Reservation) public whitelist;
    mapping(uint=>mapping(address=>ReservedHotToken)) public thirtyBonusToken;
    mapping(uint=>mapping(address=>ReservedHotToken)) public twentyBonusToken;
    mapping(uint=>mapping(address=>ReservedHotToken)) public tenBonusToken;
    mapping(uint=>mapping(address=>ReservedHotToken)) public normalToken;
    
    function HotokenReservation() public {

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
