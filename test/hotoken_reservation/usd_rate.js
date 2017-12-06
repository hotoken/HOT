const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation set usd rate', function(accounts) {
  let hotoken
  
  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it('should have initial value for usd rate map', async function() {
    const ETHRate = (await hotoken.getUSDRate("ETH")).toNumber()
    const BTCRate = (await hotoken.getUSDRate("BTC")).toNumber()
    const USDRate = (await hotoken.getUSDRate("USD")).toNumber()

    expect(ETHRate).to.be.equal(400)
    expect(BTCRate).to.be.equal(11000)
    expect(USDRate).to.be.equal(1)
  })

  it('should be able to set usd rate for any currency', async function() {
    await hotoken.setUSDRate("ETH", 500)
    await hotoken.setUSDRate("BTC", 12000)
    await hotoken.setUSDRate("USD", 12)

    const ETHRate = (await hotoken.getUSDRate("ETH")).toNumber()
    const BTCRate = (await hotoken.getUSDRate("BTC")).toNumber()
    const USDRate = (await hotoken.getUSDRate("USD")).toNumber()

    expect(ETHRate).to.be.equal(500)
    expect(BTCRate).to.be.equal(12000)
    expect(USDRate).to.be.equal(12)
  })

  it('should be able to get usd rate for currency that not put into map', async function() {
    try {
      const UnknownCoinRate = (await hotoken.getUSDRate("UNKNOWN")).toNumber()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to set usd rate for any currency if not call by contract owner', async function() {
    const user1 = accounts[1]

    const ETHRateBefore = (await hotoken.getUSDRate("ETH")).toNumber()
    const BTCRateBefore = (await hotoken.getUSDRate("BTC")).toNumber()
    const USDRateBefore = (await hotoken.getUSDRate("USD")).toNumber()

    try {
      await hotoken.setUSDRate("ETH", 600, {from: user1})
      await hotoken.setUSDRate("BTC", 13000, {from: user1})
      await hotoken.setUSDRate("USD", 20, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const ETHRateAfter = (await hotoken.getUSDRate("ETH")).toNumber()
    const BTCRateAfter = (await hotoken.getUSDRate("BTC")).toNumber()
    const USDRateAfter = (await hotoken.getUSDRate("USD")).toNumber()

    // should be the same as above that we set ETH => 500, BTC => 12000, USD => 12
    expect(ETHRateAfter).to.be.equal(ETHRateBefore)
    expect(BTCRateAfter).to.be.equal(BTCRateBefore)
    expect(USDRateAfter).to.be.equal(USDRateBefore)
  })
})