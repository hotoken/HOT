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
    const result = await instance.addToWhitelist(newAccount, limit)
    expect(result).to.be.ok
    expect(result).to.be.not.empty
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

  it('should be able to add many new addresses to the whitelist', async function() {
    const newAccounts = [accounts[2], accounts[3], accounts[4]]
    const limits = [100, 200, 300]
    const instance = await HotokenReservation.deployed()
    const result = await instance.addManyToWhitelist(newAccounts, limits)
    expect(result).to.be.ok
    expect(result).to.be.not.empty
    expect(Object.keys(result)).to.have.lengthOf(3)
    expect((await instance.getLimitOf.call(newAccounts[0])).toNumber()).to.be.equal(limits[0])
    expect((await instance.getLimitOf.call(newAccounts[1])).toNumber()).to.be.equal(limits[1])
    expect((await instance.getLimitOf.call(newAccounts[2])).toNumber()).to.be.equal(limits[2])
  })

  it('should be able to update the limit of address in whitelist', async function() {
    const account = accounts[1]
    const limit = 1000
    const instance = await HotokenReservation.deployed()
    const result = await instance.addToWhitelist(account, limit)
    expect(result).to.be.ok
    expect(result).to.be.not.empty
    expect(Object.keys(result)).to.have.lengthOf(3)
    expect((await instance.getLimitOf.call(account)).toNumber()).to.be.equal(limit)
  })
})
