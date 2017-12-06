const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {

  describe('setConversionRate', function() {
    it('should set conversion rate value of input currency', async function() {
      const h = await HotokenReservation.deployed()
      const rate = 42525; // 425.25$ per 1 ETH
      await h.setConversionRate('ETH', rate);
      const returnedRate = await h.getConversionRate.call('ETH')
      expect(returnedRate.toNumber()).to.be.equal(rate)
    })
  })

  describe('weiToUsd', function() {
    it('1 ETH => 425.25$', async function() {
      const h = await HotokenReservation.deployed()
      const rate = 42525; // 425.25$ per 1 ETH
      await h.setConversionRate('ETH', rate)

      let wei = 1 * 10 ** 18 // 1ETH
      let s = await h.weiToUsd(wei)
      expect(s.toNumber()).to.be.equal(42525 * 10 ** 16)

      wei = 5 * 10 ** 17 // 0.5ETH
      s = await h.weiToUsd(wei)
      expect(s.toNumber()).to.be.equal(212625 * 10 ** 15)

      wei = 20 * 10 ** 18 // 20ETH
      s = await h.weiToUsd(wei)
      expect(s.toNumber()).to.be.equal(850500 * 10 ** 16)
    })

    it('1 ETH => 300.50$', async function() {
      const h = await HotokenReservation.deployed()
      const rate = 30050; // 300.50$ per 1 ETH
      await h.setConversionRate('ETH', rate)

      let wei = 1 * 10 ** 18 // 1ETH
      let s = await h.weiToUsd(wei)
      expect(s.toNumber()).to.be.equal(30050 * 10 ** 16)

      wei = 8 * 10 ** 17 // 0.8ETH
      s = await h.weiToUsd(wei)
      expect(s.toNumber()).to.be.equal(24040 * 10 ** 16)

      wei = 15 * 10 ** 18 // 15ETH
      s = await h.weiToUsd(wei)
      expect(s.toNumber()).to.be.equal(450750 * 10 ** 16)
    })
  })

})
