pragma solidity ^0.4.17;

contract HotokenReservation {

    mapping(address=>uint) public whitelist;

    function HotokenReservation() public {

    }

    function addToWhitelist(address _newAddress, uint _amount) public {
        whitelist[_newAddress] = _amount;
    }

    function getLimitOf(address _address) public view returns(uint) {
        return whitelist[_address];
    }
}
