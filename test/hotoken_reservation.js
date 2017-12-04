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
    expect(result.receipt.status).to.be.equal(1)
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
    expect(result.receipt.status).to.be.equal(1)
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

  it('should not be able to add address to whitelist if caller is not the owner', async function() {
    const newAccount = accounts[1]
    const instance = await HotokenReservation.deployed()
    try {
      await instance.addToWhitelist(newAccount, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to add many addresses to whitelist if caller is not the owner', async function() {
    const newAccounts = [accounts[2], accounts[3], accounts[4]]
    const instance = await HotokenReservation.deployed()
    try {
      await instance.addManyToWhitelist(newAccounts, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to remove address to whitelist if caller is not the owner', async function() {
    const account = accounts[1]
    const instance = await HotokenReservation.deployed()
    try {
      await instance.removeFromWhiteList(account, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to remove many addresses to whitelist if caller is not the owner', async function() {
    const listOfAccounts = [accounts[2], accounts[3], accounts[4]]
    const instance = await HotokenReservation.deployed()
    try {
      await instance.removeManyFromWhitelist(accounts, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})

contract('HotokenReservation buy token', function(accounts) {

  it('should be able to retrieve 2 ether for contributor that is in the whitelist', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const rate = (await instance.rate.call()).toNumber()
    await instance.addToWhitelist(user1)

    expect((await instance.whitelist.call(user1)).toNumber()).to.be.equal(1)

    const amountEther = 2
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(accounts[0])).toNumber()
    const tokenSoldBefore = (await instance.tokenSold.call()).toNumber()

    await instance.sendTransaction({from: user1, value: amountWei})
    const user1BalanceAfter = (await instance.balanceOf(user1)).toNumber()
    const ownerEtherAfter = (await web3.eth.getBalance(accounts[0])).toNumber()
    const tokenSoldAfter = (await instance.tokenSold.call()).toNumber()

    expect(user1BalanceAfter).to.be.equal(rate * amountWei)
    expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
    expect(tokenSoldAfter).to.be.equal(Number(tokenSoldBefore + (rate * amountWei)))
    
  })

  it('should not be able to retrieve ether from address that it is not in the whitelist', async function() {
    const instance = await HotokenReservation.deployed()

    const user2 = accounts[2]
    const rate = (await instance.rate.call()).toNumber()
    expect((await instance.whitelist.call(user2)).toNumber()).to.be.equal(0)

    const amountEther = 2
    const amountWei = web3.toWei(amountEther, 'ether')
    const tokenSold = (await instance.tokenSold.call()).toNumber()

    try {
      await instance.sendTransaction({from: user2, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    expect(tokenSold).to.be.equal(Number(rate * amountWei))
  })

  it('should not be able to retrieve ether from owner contract address', async function() {
    const instance = await HotokenReservation.deployed()
    const rate = (await instance.rate.call()).toNumber()

    const amountEther = 2
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(accounts[0])).toNumber()
    const tokenSold = (await instance.tokenSold.call()).toNumber()

    try {
      await instance.sendTransaction({from: accounts[0], value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    expect(tokenSold).to.be.equal(Number(rate * amountWei))
  })

  it('should be able to log event if send ether success', async function() {
    const instance = await HotokenReservation.deployed()
    const user2 = accounts[2]
    const rate = (await instance.rate.call()).toNumber()
    await instance.addToWhitelist(user2)

    const amountEther = 5
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(accounts[0])).toNumber()
    const tokenSoldBefore = (await instance.tokenSold.call()).toNumber()

    const tx = await instance.sendTransaction({from: user2, value: amountWei})
    const user2BalanceAfter = (await instance.balanceOf(user2)).toNumber()
    const ownerEtherAfter = (await web3.eth.getBalance(accounts[0])).toNumber()
    const tokenSoldAfter = (await instance.tokenSold.call()).toNumber()

    expect(user2BalanceAfter).to.be.equal(rate * amountWei)
    expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
    expect(tokenSoldAfter).to.be.equal(Number(tokenSoldBefore + (rate * amountWei)))

    // check events log
    expect(tx.logs).to.be.ok
    expect(tx.logs[0].event).to.be.equal('TokenPurchase')
    expect(tx.logs[0].args.purchaser).to.be.equal(user2)
    expect(tx.logs[0].args.beneficiary).to.be.equal(user2)
    expect(tx.logs[0].args.value.toNumber()).to.be.equal(Number(amountWei))
    expect(tx.logs[0].args.amount.toNumber()).to.be.equal(rate * amountWei)
  })
})

contract('HotokenReservation transfer token', function(accounts) {

  it('should be able transfer token by owner address', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]

    await instance.transfer(user1, 1000)
    expect((await instance.balanceOf(user1)).toNumber()).to.be.equal(1000)
  })
  
  it('should not be able transfer token by not owner address', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const user2 = accounts[2]

    try {
      await instance.transfer(user2, 1000, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able transfer token to 0x address', async function() {
    const instance = await HotokenReservation.deployed()

    try {
      await instance.transfer("0x0", 1000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able transfer token to own contract itself', async function() {
    const instance = await HotokenReservation.deployed()

    try {
      await instance.transfer(accounts[0], 1000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})

contract('HotokenReservation custom rate', function(accounts) {
  
  it('should be able to set rate via contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    const rateBefore = (await instance.rate.call()).toNumber()
    const customRate = 20
    await instance.setRate(customRate)

    const rateAfter = (await instance.rate.call()).toNumber()
    expect(rateAfter).to.be.equal(customRate)
    expect(rateAfter).to.not.be.equal(rateBefore)
  })

  it('should not be able to set rate via another address', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const rateBefore = (await instance.rate.call()).toNumber()
    const customRate = 20
    try {
      await instance.setRate(customRate, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const rateAfter = (await instance.rate.call()).toNumber()
    expect(rateAfter).to.be.equal(rateBefore)
  })
})  