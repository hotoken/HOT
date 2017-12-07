const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation set discount rate', function(accounts) {
  let hotoken

  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it('initial discount rate should be sixty five discount rate', async function() {
    const discountRate = (await hotoken.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(65)
  })

  it('should be able to set discount by contract owner', async function() {
    await hotoken.setDiscountRate(3)
    let discountRate = (await hotoken.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(65)

    await hotoken.setDiscountRate(2)
    discountRate = (await hotoken.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(45)

    await hotoken.setDiscountRate(1)
    discountRate = (await hotoken.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(25)

    await hotoken.setDiscountRate(0)
    discountRate = (await hotoken.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(0)
  })

  it('should not be able to set discount that more than 65%', async function() {
    try {
      await hotoken.setDiscountRate(4)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const discountRate = (await hotoken.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(65)
  })

  it('should not be able to set discount if not call by contract owner', async function() {
    const user1 = accounts[1]
    try {
      await hotoken.setDiscountRate(2, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})

contract('HotokenReservation', function() {
  describe('applyDiscount', function() {
    it('65% discount', async function() {
      const h = await HotokenReservation.deployed()
      await h.setDiscountRate(3) // 65%
      let amount = 5 * 10 ** 18 // 5 tokens
      let net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(825 * 10 ** 16) // 8.25 tokens

      amount = 848 * 10 ** 15 // 0.848 tokens
      net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(13992 * 10 ** 14) // 1.3992 tokens

      amount = 2414 * 10 ** 16 // 24.14 tokens
      net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(39831 * 10 ** 15) // 39.831 tokens
    })

    it('45% discount', async function() {
      const h = await HotokenReservation.deployed()
      await h.setDiscountRate(2) // 45%
      let amount = 5 * 10 ** 18 // 5 tokens
      let net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(725 * 10 ** 16) // 7.25 tokens

      amount = 848 * 10 ** 15 // 0.848 tokens
      net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(12296 * 10 ** 14) // 1.2296 tokens

      amount = 2414 * 10 ** 16 // 24.14 tokens
      net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(35003 * 10 ** 15) // 35.003 tokens
    })

    it('25% discount', async function() {
      const h = await HotokenReservation.deployed()
      await h.setDiscountRate(1) // 25%
      let amount = 5 * 10 ** 18 // 5 tokens
      let net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(625 * 10 ** 16) // 6.25 tokens

      amount = 848 * 10 ** 15 // 0.848 tokens
      net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(106 * 10 ** 16) // 1.06 tokens

      amount = 2414 * 10 ** 16 // 24.14 tokens
      net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(30175 * 10 ** 15) // 30.175 tokens
    })

    it('no discount', async function() {
      const h = await HotokenReservation.deployed()
      await h.setDiscountRate(0) // no discount
      let amount = 5 * 10 ** 18 // 5 tokens
      let net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(5 * 10 ** 18)

      amount = 848 * 10 ** 15 // 0.848 tokens
      net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(848 * 10 ** 15)

      amount = 2414 * 10 ** 16 // 24.14 tokens
      net = await h.applyDiscount(amount)
      expect(net.toNumber()).to.be.equal(2414 * 10 ** 16)
    })
  })
})
