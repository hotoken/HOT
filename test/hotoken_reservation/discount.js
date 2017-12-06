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