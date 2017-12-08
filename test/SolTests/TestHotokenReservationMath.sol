pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/HotokenReservation.sol";

contract TestHotokenReservationMath
{

    function beforeEach() public
    {
        

        
    }

    function testInitiallyPaused() public
    {
        HotokenReservation htkn = HotokenReservation(DeployedAddresses.HotokenReservation());
        
        Assert.equal(htkn.isPause(),true,"Initial contract is paused.");
    }

    function testBuy42USDTokens() public
    {
        HotokenReservation htkn = HotokenReservation(DeployedAddresses.HotokenReservation());
        htkn.setPause(false);
        htkn.setDiscountRate(uint(3));
        htkn.setUSDRate("USD",(uint(100)));

        Assert.equal(htkn.calculateRate("USD"), uint(10), "There should be 10 Hotoken to the USD.");
    }

    function testSanity() public
    {
        Assert.equal(uint(1),uint(1),"One is One.");
    }
}