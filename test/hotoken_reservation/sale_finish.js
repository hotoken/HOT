const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation') 

contract('HotokenReservation, set sale finish flag', function(accounts) {
  
  it('should have initial value for sale finish flag', async function() {
    const instance = await HotokenReservation.deployed()
    expect((await instance.getSaleFinished())).to.be.false
  })

  it('should be able to set sale finish flag', async function() {
    const instance = await HotokenReservation.deployed()

    await instance.setSaleFinished(true)
    expect((await instance.getSaleFinished())).to.be.true
  })

  it('should not be able to set minimum sold if not call by owner', async function() {
    const instance = await HotokenReservation.deployed()

    try {
      await instance.setSaleFinished(false, {from: accounts[1]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    expect((await instance.getSaleFinished())).to.be.true
  })
})