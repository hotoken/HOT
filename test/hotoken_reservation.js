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

  it('should be able to add new adress with limit to whitelist', async function() {
    const newAccount = accounts[1]
    const limit = 100
    const instance = await HotokenReservation.deployed()
    await instance.addToWhitelist(newAccount, limit)
    const whitelistLimit = await instance.whitelist.call(newAccount)
    expect(whitelistLimit.toNumber()).to.equal(limit)
  })

})
