const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation set discount rate', function(accounts) {
  
  it('initial discount rate should be zero discount rate', async function() {
    const instance = await HotokenReservation.deployed()
    const discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(65)
  })

  it('should be able to set discount by contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    await instance.setDiscountRate(3)
    let discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(65)

    await instance.setDiscountRate(2)
    discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(45)

    await instance.setDiscountRate(1)
    discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(25)

    await instance.setDiscountRate(0)
    discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(0)
  })

  it('should not be able to set discount that more than 30%', async function() {
    const instance = await HotokenReservation.deployed()
    try {
      await instance.setDiscountRate(4)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const discountRate = (await instance.getDiscountRate()).toNumber()
    // should be the same as above that we set to 0%
    expect(discountRate).to.be.equal(0)
  })

  it('should not be able to set discount if not call by contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    try {
      await instance.setDiscountRate(2, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})