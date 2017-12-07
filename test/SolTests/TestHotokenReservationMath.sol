pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/HotokenReservation.sol";

contract TestHotokenReservationMath
{
    function testSanity() public
    {
        Assert.equal(uint(1),uint(1),"One is One.");
    }
}