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

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.equal(8250*10**18)
    })
    it('1ETH/$500/65% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(3)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.equal(2805*10**18)
    })
    it('1ETH/$500/65% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(3)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.equal(181500*10**18)
    })

    it('1ETH/$380.25/65% buy:1ETH', async function() {
      await h.setConversionToUSDCentsRate(38025)
      await h.setDiscountRate(3)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.equal(6274125*10**15)
    })
    it('1ETH/$380.25/65% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(38025)
      await h.setDiscountRate(3)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.equal(21332025*10**14)
    })
    it('1ETH/$380.25/65% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(38025)
      await h.setDiscountRate(3)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.equal(13803075*10**16)
    })

    it('1ETH/$500/45% buy:1ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(2)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.equal(7250*10**18)
    })
    it('1ETH/$500/45% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(2)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.equal(2465*10**18)
    })
    it('1ETH/$500/45% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(2)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.equal(159500*10**18)
    })

    it('1ETH/$500/25% buy:1ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(1)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.equal(6250*10**18)
    })
    it('1ETH/$500/25% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(1)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.equal(2125*10**18)
    })
    it('1ETH/$500/25% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(1)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.equal(137500*10**18)
    })

    it('1ETH/$500/0% buy:1ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(0)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(1*10**18)))
      expect(tokens.toNumber()).to.be.equal(5000*10**18)
    })
    it('1ETH/$500/0% buy:0.34ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(0)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(34*10**16)))
      expect(tokens.toNumber()).to.be.equal(1700*10**18)
    })
    it('1ETH/$500/0% buy:22ETH', async function() {
      await h.setConversionToUSDCentsRate(50000) // 1ETH = $500.00
      await h.setDiscountRate(0)

      let tokens = await h.applyDiscount(await h.usdToTokens(await h.toUsd(22*10**18)))
      expect(tokens.toNumber()).to.be.equal(110000*10**18)
    })
  })
})
