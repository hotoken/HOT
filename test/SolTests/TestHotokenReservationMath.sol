pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/HotokenReservation.sol";

contract TestHotokenReservationMath
{
    function testSanity() public
    {
        Assert.equal(1,1,"One is One.");
    }
}