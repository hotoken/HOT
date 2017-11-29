const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {

  it('should be able to deployed', async function() {
    const instance = await HotokenReservation.deployed()
    expect(instance).to.be.ok
  })

  it('should create empty whitelist', async function() {
    const instance = await HotokenReservation.deployed()
    expect(instance.whitelist).to.be.ok
  })

})