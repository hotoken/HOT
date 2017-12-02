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

  it('should be able to add new adress to whitelist', async function() {
    const newAccount = accounts[1]
    const instance = await HotokenReservation.deployed()
    const result = await instance.addToWhitelist(newAccount)
    expect(result).to.be.ok
    expect(result).to.be.not.empty
    expect(Object.keys(result)).to.have.lengthOf(3)
  })

  it('should be able check address in the whitelist', async function() {
    const account = accounts[1]
    const instance = await HotokenReservation.deployed()
    const exists = await instance.whitelist.call(account)
    expect(exists.toNumber()).to.equal(1)
  })

  it('should be able to add many new addresses to the whitelist', async function() {
    const newAccounts = [accounts[2], accounts[3], accounts[4]]
    const instance = await HotokenReservation.deployed()
    const result = await instance.addManyToWhitelist(newAccounts)
    expect(result).to.be.ok
    expect(result).to.be.not.empty
    expect(Object.keys(result)).to.have.lengthOf(3)
    expect((await instance.whitelist.call(newAccounts[0])).toNumber()).to.be.equal(1)
    expect((await instance.whitelist.call(newAccounts[1])).toNumber()).to.be.equal(1)
    expect((await instance.whitelist.call(newAccounts[2])).toNumber()).to.be.equal(1)
  })

  it('should be able to remove address from whitelist', async function() {
    const account = accounts[1]
    const instance = await HotokenReservation.deployed()
    await instance.removeFromWhiteList(account)
    const exists = await instance.whitelist.call(account)
    expect(exists.toNumber()).to.equal(0)
  })

  it('should be able to remove many addresses from whitelist', async function() {
    const listOfAccounts = [accounts[2], accounts[3], accounts[4]]
    const instance = await HotokenReservation.deployed()
    await instance.removeManyFromWhitelist(accounts)
    expect((await instance.whitelist.call(listOfAccounts[0])).toNumber()).to.be.equal(0)
    expect((await instance.whitelist.call(listOfAccounts[1])).toNumber()).to.be.equal(0)
    expect((await instance.whitelist.call(listOfAccounts[2])).toNumber()).to.be.equal(0)
  })
})

contract('HotokenReservation buy token', function(accounts) {

  it('should be able to retrieve 2 ether for contributor that is in the whitelist', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const rate = (await instance.rate.call()).toNumber()
    await instance.addToWhitelist(user1)

    expect((await instance.whitelist.call(user1)).toNumber()).to.be.equal(1)

    var amountEther = 2
    var amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(accounts[0])).toNumber()

    try {
      await instance.sendTransaction({from: user1, value: amountWei})
      const user1BalanceAfter = (await instance.balanceOf(user1)).toNumber()
      const ownerEtherAfter = (await web3.eth.getBalance(accounts[0])).toNumber()

      expect(user1BalanceAfter).to.be.equal(rate * amountWei)
      expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
      expect((await instance.weiRaised.call()).toNumber()).to.be.equal(Number(amountWei))
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to retrieve ether from address that it is not in the whitelist', async function() {
    const instance = await HotokenReservation.deployed()

    const user2 = accounts[2]
    const rate = (await instance.rate.call()).toNumber()
    expect((await instance.whitelist.call(user2)).toNumber()).to.be.equal(0)

    var amountEther = 2
    var amountWei = web3.toWei(amountEther, 'ether')

    try {
      await instance.sendTransaction({from: user2, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    expect((await instance.weiRaised.call()).toNumber()).to.be.equal(Number(amountWei))
  })

  it('should not be able to retrieve ether from owner contract address', async function() {
    const instance = await HotokenReservation.deployed()
    const rate = (await instance.rate.call()).toNumber()

    var amountEther = 2
    var amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(accounts[0])).toNumber()

    try {
      await instance.sendTransaction({from: accounts[0], value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    expect((await instance.weiRaised.call()).toNumber()).to.be.equal(Number(amountWei))
  })
})