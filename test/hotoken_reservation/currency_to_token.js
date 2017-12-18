const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

/// instead of test the whole flow of buying,
/// I decide to test the internal conversion so we don't need to care about
/// other state of the contract

contract('HotokenReservation', function(accounts) {
  describe('currency->token', function() {
    let h
    before(async function() {
      h = await HotokenReservation.deployed()
    })

    it('1ETH/$500/65% buy:1ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(3)

      let tokens = (await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.equal(14285714285714286*10**6)
    })

    it('1ETH/$500/65% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(3)

      let tokens = (await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.equal(48571428571428571429*10**2)
    })

    it('1ETH/$500/65% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(3)

      let tokens = (await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.equal(3142857142857143*10**8)
    })

    it('1ETH/$380.25/65% buy:1ETH', async function() {
      await h.setConversionToUSDCentsRate(38025)
      await h.setDiscountRate(3)

      // 10864.2857142857142857
      let tokens = (await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.equal(10864285714285714*10**6)
    })

    it('1ETH/$380.25/65% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(38025)
      await h.setDiscountRate(3)

      // 3693.8571428571428571
      let tokens = (await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.equal(3693857142857143*10**6)
    })

    it('1ETH/$380.25/65% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(38025)
      await h.setDiscountRate(3)

      let tokens = (await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.equal(2390142857142857*10**8)
    })

    it('1ETH/$500/45% buy:1ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(2)

      let tokens = (await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.closeTo(9090909090909092*10**6, 10**7)
    })

    it('1ETH/$500/45% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(2)

      let tokens = (await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.closeTo(3090909090909091*10**6, 10**7)
    })
    
    it('1ETH/$500/45% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(2)

      let tokens = (await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.equal(200000*10**18)
    })

    it('1ETH/$500/25% buy:1ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(1)

      let tokens = (await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.closeTo(6666666666666666666666, 10**7)
    })

    it('1ETH/$500/25% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(1)

      let tokens = (await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.closeTo(2266666666666666666666, 10**7)
    })

    it('1ETH/$500/25% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(1)

      let tokens = (await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.closeTo(146666666666666666666666, 10**7)
    })

    it('1ETH/$500/0% buy:1ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(0)

      let tokens = (await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.equal(5000*10**18)
    })

    it('1ETH/$500/0% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(0)

      let tokens = (await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.equal(1700*10**18)
    })
    it('1ETH/$500/0% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(0)

      let tokens = (await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.equal(110000*10**18)
    })
  })
})
