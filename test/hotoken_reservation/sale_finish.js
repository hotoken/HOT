const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation') 

contract('HotokenReservation, set sale finish flag', function(accounts) {
  let hotoken

  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it('should have initial value for sale finish flag', async function() {
    expect((await hotoken.getSaleFinished())).to.be.false
  })

  it('should be able to set sale finish flag', async function() {
    await hotoken.setSaleFinished(true)
    expect((await hotoken.getSaleFinished())).to.be.true
  })

  it('should not be able to set minimum sold if not call by owner', async function() {
    try {
      await hotoken.setSaleFinished(false, {from: accounts[1]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    expect((await hotoken.getSaleFinished())).to.be.false
  })
})