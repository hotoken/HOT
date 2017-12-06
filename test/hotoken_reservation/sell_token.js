const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation buy token', function(accounts) {
  
    it('should be able to retrieve ether for contributor that is in the whitelist', async function() {
      const instance = await HotokenReservation.deployed()
      const HTKN_PER_USD = (await instance.HTKN_PER_USD.call()).toNumber()
      const owner = accounts[0]
      const user1 = accounts[1]
  
      // set pause to false
      await instance.setPause(false)
  
      // add to whitelist first
      await instance.addToWhitelist(user1)
      expect((await instance.existsInWhitelist(user1)).toNumber()).to.be.equal(1)
  
      // set mininum purchase from 50k to 100
      await instance.setMinimumPurchase(100)
      await instance.setUSDRate("ETH", 3)
  
      const amountEther = 0.25
      const amountWei = web3.toWei(amountEther, 'ether')
  
      const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
      const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
  
      await instance.sendTransaction({from: user1, value: amountWei})
      const user1BalanceAfter = (await instance.balanceOf(user1)).toNumber()
      const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
      const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
  
      expect(user1BalanceAfter).to.be.equal(4125000000000000000)
      expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
      expect(tokenSoldAfter).to.be.equal(Number(tokenSoldBefore + 264000000000000000000000))
  
      // need to check balance of owner
    })
  
    it('check the tokens that user received, it comes from correct calculation', async function() {
      const instance = await HotokenReservation.deployed()
      const HTKN_PER_USD = (await instance.HTKN_PER_USD.call()).toNumber()
      const discountRate = (await instance.getDiscountRate()).toNumber()
      const usdRate = (await instance.getUSDRate("ETH")).toNumber()
      const owner = accounts[0]
      const user4 = accounts[4]
  
      // set pause to false
      await instance.setPause(false)
      await instance.setDiscountRate(3)
      expect(discountRate).to.be.equal(65)
  
      // add to whitelist first
      await instance.addToWhitelist(user4)
      expect((await instance.existsInWhitelist(user4)).toNumber()).to.be.equal(1)
  
      // set mininum purchase from 50k to 1k
      await instance.setMinimumPurchase(1000)
  
      const amountEther = 3
      const amountWei = web3.toWei(amountEther, 'ether')
  
      const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
      const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
      const user4BalanceBefore = (await instance.balanceOf(user4)).toNumber()
  
      await instance.sendTransaction({from: user4, value: amountWei})
      const user4BalanceAfter = (await instance.balanceOf(user4)).toNumber()
      const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
      const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
  
      expect(user4BalanceAfter).to.be.equal(19800000000000000000000)
      expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
      expect(tokenSoldAfter).to.be.equal(tokenSoldBefore + 19800000000000000000000)
  
      // need to check balance of owner
    })
  
    it('should be able to retrieve ether for contributor that already exists in ledger even if amount is less than minimum purchase', async function() {
      const instance = await HotokenReservation.deployed()
      const HTKN_PER_USD = (await instance.HTKN_PER_USD.call()).toNumber()
      const discountRate = (await instance.getDiscountRate()).toNumber()
      const usdRate = (await instance.getUSDRate("ETH")).toNumber()
      const owner = accounts[0]
      const user1 = accounts[1]
  
      await instance.setDiscountRate(2)
      const discountRateAfter = (await instance.getDiscountRate()).toNumber()
      expect(discountRateAfter).to.be.equal(45)
  
      // set mininum purchase from 50k to 100
      await instance.setMinimumPurchase(100)
      
      const amountEther = 4
      const amountWei = web3.toWei(amountEther, 'ether')
  
      const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
      const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
      const user1BalanceBefore = (await instance.balanceOf(user1)).toNumber()
  
      await instance.sendTransaction({from: user1, value: amountWei})
      const user1BalanceAfter = (await instance.balanceOf(user1)).toNumber()
      const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
      const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
  
      expect(user1BalanceAfter).to.be.closeTo(user1BalanceBefore + 5800000000000000000000, 0.000001)
      expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
      expect(tokenSoldAfter).to.be.closeTo(tokenSoldBefore + 5800000000000000000000, 0.000001)
  
      // need to check balance of owner
    })
  
    it('should be able to sell token more than supply', async function() {
      const instance = await HotokenReservation.deployed()
      const HTKN_PER_USD = (await instance.HTKN_PER_USD.call()).toNumber()
      const discountRate = (await instance.getDiscountRate()).toNumber()
      const usdRate = (await instance.getUSDRate("ETH")).toNumber()
      const owner = accounts[0]
      const user1 = accounts[1]
  
      // set USD Rate
      await instance.setUSDRate("ETH", 500000000)
  
      const amountEther = 40
      const amountWei = web3.toWei(amountEther, 'ether')
  
      const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
      const user1BalanceBefore = (await instance.balanceOf(user1)).toNumber()
  
      try {
        await instance.sendTransaction({from: user1, value: amountWei})
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
      
      const user1BalanceAfter = (await instance.balanceOf(user1)).toNumber()
      const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
  
      expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)
      expect(user1BalanceAfter).to.be.equal(user1BalanceBefore)
  
      // need to check balance of owner
    })
  
    it('should not be able to retrieve ether from address that it is not in the whitelist', async function() {
      const instance = await HotokenReservation.deployed()
  
      const user2 = accounts[2]
      expect((await instance.existsInWhitelist(user2)).toNumber()).to.be.equal(0)
  
      const amountEther = 2
      const amountWei = web3.toWei(amountEther, 'ether')
      const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
  
      try {
        await instance.sendTransaction({from: user2, value: amountWei})
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
  
      const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
      expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)
  
      // need to check balance of owner
    })
    
    it('should not be able to retrieve ether if contract is paused', async function() {
      const instance = await HotokenReservation.deployed()
  
      const user1 = accounts[1]
      expect((await instance.existsInWhitelist(user1)).toNumber()).to.be.equal(1)
  
      await instance.setPause(true)
  
      const amountEther = 2
      const amountWei = web3.toWei(amountEther, 'ether')
      const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
  
      try {
        await instance.sendTransaction({from: user1, value: amountWei})
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
  
      const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
      expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)
  
      // need to check balance of owner
    })
  
    it('should not be able to retrieve ether from owner contract address', async function() {
      const instance = await HotokenReservation.deployed()
      const owner = accounts[0]
  
      await instance.setPause(false)
  
      const amountEther = 2
      const amountWei = web3.toWei(amountEther, 'ether')
  
      const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
      const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
  
      try {
        await instance.sendTransaction({from: owner, value: amountWei})
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
      const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
      expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)
  
      // need to check balance of owner
    })
  
    it('should be able to log event if send ether success', async function() {
      const instance = await HotokenReservation.deployed()
      const HTKN_PER_USD = (await instance.HTKN_PER_USD.call()).toNumber()
      const discountRate = (await instance.getDiscountRate()).toNumber()
  
      /// set USD Rate
      await instance.setUSDRate("ETH", 400)
  
      const usdRate = (await instance.getUSDRate("ETH")).toNumber()
      const owner = accounts[0]
      const user2 = accounts[2]
  
      // add to whitelist first
      await instance.addToWhitelist(user2)
      expect((await instance.existsInWhitelist(user2)).toNumber()).to.be.equal(1)
  
      const amountEther = 40
      const amountWei = web3.toWei(amountEther, 'ether')
  
      const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
      const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
  
      const tx = await instance.sendTransaction({from: user2, value: amountWei})
  
      // check events log
      expect(tx.logs).to.be.ok
      expect(tx.logs[0].event).to.be.equal('TokenPurchase')
      expect(tx.logs[0].args.purchaser).to.be.equal(user2)
      expect(tx.logs[0].args.beneficiary).to.be.equal(user2)
      expect(tx.logs[0].args.value.toNumber()).to.be.equal(Number(amountWei))
      expect(tx.logs[0].args.amount.toNumber()).to.be.equal(HTKN_PER_USD * (100 + discountRate) / 100 * usdRate * amountWei)
  
      // need to check balance of owner
    })
  })