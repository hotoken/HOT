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
  
      const whiteListInfo = await instance.whiteListInfo.call(0)
      expect(whiteListInfo[0]).to.be.equal(newAccount)
      expect(whiteListInfo[1].toNumber()).to.be.equal(1)
    })
  
    it('should be able check address in the whitelist', async function() {
      const account = accounts[1]
      const instance = await HotokenReservation.deployed()
      const exists = await instance.whitelist.call(account)
      expect(exists.toNumber()).to.equal(1)
    })
  
    it('should be able check address in the whitelist via external method', async function() {
      const account = accounts[1]
      const instance = await HotokenReservation.deployed()
      const exists = await instance.existsInWhitelist(account, {from: account})
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
  
      let whiteListInfo = await instance.whiteListInfo.call(0)
      expect(whiteListInfo[0]).to.be.equal(accounts[1])
      expect(whiteListInfo[1].toNumber()).to.be.equal(1)
  
      whiteListInfo = await instance.whiteListInfo.call(1)
      expect(whiteListInfo[0]).to.be.equal(accounts[2])
      expect(whiteListInfo[1].toNumber()).to.be.equal(1)
  
      whiteListInfo = await instance.whiteListInfo.call(2)
      expect(whiteListInfo[0]).to.be.equal(accounts[3])
      expect(whiteListInfo[1].toNumber()).to.be.equal(1)
  
      whiteListInfo = await instance.whiteListInfo.call(3)
      expect(whiteListInfo[0]).to.be.equal(accounts[4])
      expect(whiteListInfo[1].toNumber()).to.be.equal(1)
    })
  
    it('should be able to remove address from whitelist', async function() {
      const account = accounts[1]
      const instance = await HotokenReservation.deployed()
      await instance.removeFromWhiteList(account)
      const exists = await instance.whitelist.call(account)
      expect(exists.toNumber()).to.equal(0)
  
      const whiteListInfo = await instance.whiteListInfo.call(0)
      expect(whiteListInfo[0]).to.be.equal(account)
      expect(whiteListInfo[1].toNumber()).to.be.equal(0)
    })
  
    it('should be able to remove many addresses from whitelist', async function() {
      const listOfAccounts = [accounts[2], accounts[3], accounts[4]]
      const instance = await HotokenReservation.deployed()
      await instance.removeManyFromWhitelist(accounts)
      expect((await instance.whitelist.call(listOfAccounts[0])).toNumber()).to.be.equal(0)
      expect((await instance.whitelist.call(listOfAccounts[1])).toNumber()).to.be.equal(0)
      expect((await instance.whitelist.call(listOfAccounts[2])).toNumber()).to.be.equal(0)
  
      let whiteListInfo = await instance.whiteListInfo.call(0)
      expect(whiteListInfo[0]).to.be.equal(accounts[1])
      expect(whiteListInfo[1].toNumber()).to.be.equal(0)
  
      whiteListInfo = await instance.whiteListInfo.call(1)
      expect(whiteListInfo[0]).to.be.equal(accounts[2])
      expect(whiteListInfo[1].toNumber()).to.be.equal(0)
  
      whiteListInfo = await instance.whiteListInfo.call(2)
      expect(whiteListInfo[0]).to.be.equal(accounts[3])
      expect(whiteListInfo[1].toNumber()).to.be.equal(0)
  
      whiteListInfo = await instance.whiteListInfo.call(3)
      expect(whiteListInfo[0]).to.be.equal(accounts[4])
      expect(whiteListInfo[1].toNumber()).to.be.equal(0)
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