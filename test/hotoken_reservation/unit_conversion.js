const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {

  describe('setConversionToUSDCentsRate', function() {
    it('should set conversion rate value of input currency', async function() {
      const h = await HotokenReservation.deployed()
      const rate = 42525; // 425.25$ per 1 ETH
      await h.setConversionToUSDCentsRate(rate);
      const returnedRate = await h.ethConversionToUSDCentsRate.call()
      expect(returnedRate.toNumber()).to.be.equal(rate)
    })

    it('should not be called by other who is not the owner', async function() {
      const user1 = accounts[1]
      try {
        const h = await HotokenReservation.deployed()
        const rate = 42525; // 425.25$ per 1 ETH
        await h.setConversionToUSDCentsRate(rate, {from: user1})
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
  })

  describe('weiToUsd', function() {
    it('1 ETH => 425.25$', async function() {
      const h = await HotokenReservation.deployed()
      const rate = 42525; // 425.25$ per 1 ETH
      await h.setConversionToUSDCentsRate(rate)

      let wei = 1 * 10 ** 18 // 1ETH
      let s = await h.toUsd(wei)
      expect(s.toNumber()).to.be.equal(42525 * 10 ** 16)

      wei = 5 * 10 ** 17 // 0.5ETH
      s = await h.toUsd(wei)
      expect(s.toNumber()).to.be.equal(212625 * 10 ** 15)

      wei = 20 * 10 ** 18 // 20ETH
      s = await h.toUsd(wei)
      expect(s.toNumber()).to.be.equal(850500 * 10 ** 16)
    })

    it('1 ETH => 300.50$', async function() {
      const h = await HotokenReservation.deployed()
      const rate = 30050; // 300.50$ per 1 ETH
      await h.setConversionToUSDCentsRate(rate)

      let wei = 1 * 10 ** 18 // 1ETH
      s = await h.toUsd(wei)
      expect(s.toNumber()).to.be.equal(30050 * 10 ** 16)

      wei = 8 * 10 ** 17 // 0.8ETH
      s = await h.toUsd(wei)
      expect(s.toNumber()).to.be.equal(24040 * 10 ** 16)

      wei = 15 * 10 ** 18 // 15ETH
      s = await h.toUsd(wei)
      expect(s.toNumber()).to.be.equal(450750 * 10 ** 16)
    })
  })

  describe('usdToTokens', function() {
    // 1$ => 10tokens
    it('should convert a$ to number of tokens', async function() {
      const h = await HotokenReservation.deployed()
      await h.setDiscountRate(0)

      let usd = 1 * 10 ** 18 // 1$
      let t = await h.usdToTokens(usd)
      expect(t.toNumber()).to.be.equal(10 * 10 ** 18)

      usd = 32 * 10 ** 18 // 32$
      t = await h.usdToTokens(usd)
      expect(t.toNumber()).to.be.equal(320 * 10 ** 18)

      usd = 0.025 * 10 ** 18 // 0.025$
      t = await h.usdToTokens(usd)
      expect(t.toNumber()).to.be.equal(25 * 10 ** 16)
    })
  })

})
