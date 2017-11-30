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
    const result = await instance.addToWhitelist(newAccount, 100)
    expect(Object.keys(result)).to.have.lengthOf(3)
  })

  it('should be able to retrive limit by address', async function() {
    const account = accounts[1]
    const limit = 100
    const instance = await HotokenReservation.deployed()
    const whitelistLimit = await instance.getLimitOf.call(account)
    expect(whitelistLimit.toNumber()).to.equal(limit)
  })

  it('should not be able to retrieve limit by address is not in whitelist', async function() {
    const account = accounts[2]
    const instance = await HotokenReservation.deployed()
    try {
      const whitelistLimit = await instance.getLimitOf.call(account)
    } catch(e) {
      expect(e.toString().indexOf('revert')).to.be.above(-1)
    }
  })
})
