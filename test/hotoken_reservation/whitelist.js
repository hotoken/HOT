const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {
  let hotoken
  
  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it('should create empty whitelist', async function() {
    expect(hotoken.whitelist).to.be.ok
  })

  it('should be able to add new adress to whitelist', async function() {
    const newAccount = accounts[1]
    const result = await hotoken.addToWhitelist(newAccount)
    expect(result).to.be.ok
    expect(result).to.be.not.empty
    expect(Object.keys(result)).to.have.lengthOf(3)
    expect(result.receipt.status).to.be.equal(1)

    const whiteListInfo = await hotoken.whiteListInfo.call(0)
    expect(whiteListInfo[0]).to.be.equal(newAccount)
    expect(whiteListInfo[1].toNumber()).to.be.equal(1)
  })

  it('should be able check address in the whitelist', async function() {
    const account = accounts[1]
    const exists = await hotoken.whitelist.call(account)
    expect(exists.toNumber()).to.equal(0)
  })

  it('should be able check address in the whitelist via external method', async function() {
    const account = accounts[1]
    const exists = await hotoken.existsInWhitelist(account, {from: account})
    expect(exists.toNumber()).to.equal(0)
  })

  it('should be able to add many new addresses to the whitelist', async function() {
    const newAccounts = [accounts[2], accounts[3], accounts[4]]
    const result = await hotoken.addManyToWhitelist(newAccounts)
    expect(result).to.be.ok
    expect(result).to.be.not.empty
    expect(Object.keys(result)).to.have.lengthOf(3)
    expect(result.receipt.status).to.be.equal(1)
    expect((await hotoken.whitelist.call(newAccounts[0])).toNumber()).to.be.equal(1)
    expect((await hotoken.whitelist.call(newAccounts[1])).toNumber()).to.be.equal(1)
    expect((await hotoken.whitelist.call(newAccounts[2])).toNumber()).to.be.equal(1)

    let whiteListInfo = await hotoken.whiteListInfo.call(0)
    expect(whiteListInfo[0]).to.be.equal(accounts[2])
    expect(whiteListInfo[1].toNumber()).to.be.equal(1)

    whiteListInfo = await hotoken.whiteListInfo.call(1)
    expect(whiteListInfo[0]).to.be.equal(accounts[3])
    expect(whiteListInfo[1].toNumber()).to.be.equal(1)

    whiteListInfo = await hotoken.whiteListInfo.call(2)
    expect(whiteListInfo[0]).to.be.equal(accounts[4])
    expect(whiteListInfo[1].toNumber()).to.be.equal(1)
  })

  it('should be able to remove address from whitelist', async function() {
    const account = accounts[1]

    await hotoken.addToWhitelist(account)
    await hotoken.removeFromWhiteList(account)
    const exists = await hotoken.whitelist.call(account)
    expect(exists.toNumber()).to.equal(0)

    const whiteListInfo = await hotoken.whiteListInfo.call(0)
    expect(whiteListInfo[0]).to.be.equal(account)
    expect(whiteListInfo[1].toNumber()).to.be.equal(0)
  })

  it('should be able to remove many addresses from whitelist', async function() {
    const listOfAccounts = [accounts[2], accounts[3], accounts[4]]

    await hotoken.addManyToWhitelist(listOfAccounts)
    await hotoken.removeManyFromWhitelist(listOfAccounts)
    expect((await hotoken.whitelist.call(listOfAccounts[0])).toNumber()).to.be.equal(0)
    expect((await hotoken.whitelist.call(listOfAccounts[1])).toNumber()).to.be.equal(0)
    expect((await hotoken.whitelist.call(listOfAccounts[2])).toNumber()).to.be.equal(0)

    let whiteListInfo = await hotoken.whiteListInfo.call(0)
    expect(whiteListInfo[0]).to.be.equal(accounts[2])
    expect(whiteListInfo[1].toNumber()).to.be.equal(0)

    whiteListInfo = await hotoken.whiteListInfo.call(1)
    expect(whiteListInfo[0]).to.be.equal(accounts[3])
    expect(whiteListInfo[1].toNumber()).to.be.equal(0)

    whiteListInfo = await hotoken.whiteListInfo.call(2)
    expect(whiteListInfo[0]).to.be.equal(accounts[4])
    expect(whiteListInfo[1].toNumber()).to.be.equal(0)
  })

  it('should not be able to add address to whitelist if caller is not the owner', async function() {
    const newAccount = accounts[1]
    try {
      await hotoken.addToWhitelist(newAccount, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to add many addresses to whitelist if caller is not the owner', async function() {
    const newAccounts = [accounts[2], accounts[3], accounts[4]]
    try {
      await hotoken.addManyToWhitelist(newAccounts, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to remove address to whitelist if caller is not the owner', async function() {
    const account = accounts[1]
    try {
      await hotoken.removeFromWhiteList(account, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to remove many addresses to whitelist if caller is not the owner', async function() {
    const listOfAccounts = [accounts[2], accounts[3], accounts[4]]
    try {
      await hotoken.removeManyFromWhitelist(accounts, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})