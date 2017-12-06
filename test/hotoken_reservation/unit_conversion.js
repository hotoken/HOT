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
      let s = h.weiToUsd(wei)
      expect(s).to.be.equal(42525 * 10 ** 16)
    })
  })

})
