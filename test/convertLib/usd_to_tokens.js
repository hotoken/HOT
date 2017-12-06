const {expect} = require('chai')
const ConvertLib = artifacts.require('./ConvertLib.sol')

contract('ConvertLib, convert USD To Tokens [ Rate 1 USD = 10 tokens ]', function() {
  let convertLib

  before(async function () {
    convertLib = await ConvertLib.new();
  });

  it('405.25 USD => 4052.5 tokens', async function() {
    const usd = 405.25 * Math.pow(10, 18)
    const result = await convertLib.convertUSDToTokens(0, usd)
    expect(result.toNumber()).to.be.equal(405250000000000000000000)
  })

  it('607.875 USD => 6078.75 tokens', async function() {
    const usd = 607.875 * Math.pow(10, 18)
    const result = await convertLib.convertUSDToTokens(0, usd)
    expect(result.toNumber()).to.be.equal(607875000000000000000000)
  })

  it('996.915 USD => 9969.15 tokens', async function() {
    const usd = 996.915 * Math.pow(10, 18)
    const result = await convertLib.convertUSDToTokens(0, usd)
    expect(result.toNumber()).to.be.equal(996915000000000000000)
  })

  it('500.30544 USD => 5003.0544 tokens', async function() {
    const usd = 500.30544 * Math.pow(10, 18)
    const result = await convertLib.convertUSDToTokens(0, usd)
    expect(result.toNumber()).to.be.closeTo(500305440000000000000000, 1 * Math.pow(10, -18))
  })

  it('405.25040525 USD =>  4052.5040525 tokens', async function() {
    const usd = 405.25040525 * Math.pow(10, 18)
    const result = await convertLib.convertUSDToTokens(65, usd)
    expect(result.toNumber()).to.be.closeTo(668663168662500000000000, 1 * Math.pow(10, -18))
  })
})