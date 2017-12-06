const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation') 

contract('HotokenReservation, set minimum sold', function(accounts) {
  let hotoken
  
  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it('should have initial value for minimum sold', async function() {
    expect((await hotoken.getMinimumSold()).toNumber()).to.be.equal(2000000)
  })

  it('should be able to set minimum sold', async function() {
    const newMinimumSold = 50000000

    await hotoken.setMinimumSold(newMinimumSold)
    expect((await hotoken.getMinimumSold()).toNumber()).to.be.equal(newMinimumSold)
  })

  it('should not be able to set minimum sold if not call by owner', async function() {
    const newMinimumSold = 50000000

    try {
      await hotoken.setMinimumSold(newMinimumSold, {from: accounts[1]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    expect((await hotoken.getMinimumSold()).toNumber()).to.be.equal(2000000)
  })
})