pragma solidity ^0.4.18;

import './math/SafeMath.sol';

/**
 * @title ConvertLib 
 */
library ConvertLib {

  using SafeMath for uint256;

  uint256 public constant HTKN_PER_USD = 10;

  function convertETHToUSD(uint weiAmount, uint _usdRate) public pure returns (uint256) {
    return weiAmount.mul(_usdRate).div(10 ** uint(18));
  }

  function convertUSDToTokens(uint _discountRate, uint _usdRate) public pure returns (uint256) {
    return _discountRate.add(10 ** uint(2)).mul(HTKN_PER_USD).mul(_usdRate);
  }
}
