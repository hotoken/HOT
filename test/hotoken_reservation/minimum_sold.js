const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation') 

contract('HotokenReservation, set minimum sold', function(accounts) {

  it('should have initial value for minimum sold', async function() {
    const instance = await HotokenReservation.deployed()
    expect((await instance.getMinimumSold()).toNumber()).to.be.equal(2000000)
  })

  it('should be able to set minimum sold', async function() {
    const instance = await HotokenReservation.deployed()
    const newMinimumSold = 50000000

    await instance.setMinimumSold(newMinimumSold)
    expect((await instance.getMinimumSold()).toNumber()).to.be.equal(newMinimumSold)
  })

  it('should not be able to set minimum sold if not call by owner', async function() {
    const instance = await HotokenReservation.deployed()

    await instance.setMinimumSold(2000000)
    const newMinimumSold = 50000000

    try {
      await instance.setMinimumSold(newMinimumSold, {from: accounts[1]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    expect((await instance.getMinimumSold()).toNumber()).to.be.equal(2000000)
  })
})