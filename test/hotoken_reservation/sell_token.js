const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {
  describe('buyTokens', function() {
    it('should be allocate buyer tokens', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00
      await h.setDiscountRate(0)

      let amount = web3.toWei(2, 'ether')

      await h.sendTransaction({from: user1, value: amount})

      let user1balance = await h.balanceOf(user1)
      expect(user1balance.toNumber()).to.be.equal(9000 * 10 ** 18)
    })
  })
})

// We need to seperate contract block to make them independent
contract('HotokenReservation', function(accounts) {
  describe('buyTokens', function() {
    it('should apply the discount rate', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00
      await h.setDiscountRate(1) // 25%

      let amount = web3.toWei(2, 'ether')

      await h.sendTransaction({from: user1, value: amount})

      let user1balance = await h.balanceOf(user1)
      expect(user1balance.toNumber()).to.be.equal(12000 * 10 ** 18)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('buyTokens', function() {
    it('should let buyer buy multiple times', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00
      await h.setDiscountRate(0)

      await h.sendTransaction({from: user1, value: 2 * 10 ** 18})
      let user1balance = await h.balanceOf(user1)
      expect(user1balance.toNumber()).to.be.equal(9000 * 10 ** 18)

      // second buy
      await h.sendTransaction({from: user1, value: 5 * 10 ** 18})
      user1balance = await h.balanceOf(user1)
      expect(user1balance.toNumber()).to.be.equal(31500 * 10 ** 18)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('buyTokens', function() {
    it('should update ETH amount of the buyer', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00

      await h.sendTransaction({from: user1, value: 2 * 10 ** 18})
      let eth = await h.ethAmount.call(user1)
      expect(eth.toNumber()).to.be.equal(2 * 10 ** 18)

      // second buy
      await h.sendTransaction({from: user1, value: 5 * 10 ** 16})
      eth = await h.ethAmount.call(user1)
      expect(eth.toNumber()).to.be.equal(205 * 10 ** 16)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('buyTokens', function() {
    it('should update owner balance', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      let ownerBalance = await h.balanceOf(owner)
      expect(ownerBalance.toNumber()).to.be.equal(3000000000 * 10 ** 18)

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00
      await h.setDiscountRate(0)

      await h.sendTransaction({from: user1, value: 2 * 10 ** 18})
      ownerBalance = await h.balanceOf(owner)
      expect(ownerBalance.toNumber()).to.be.equal(2999991000 * 10 ** 18)

      // second buy
      await h.sendTransaction({from: user1, value: 5 * 10 ** 18})
      ownerBalance = await h.balanceOf(owner)
      expect(ownerBalance.toNumber()).to.be.equal(2999968500 * 10 ** 18)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('buyTokens', function() {
    it('should update sold tokens', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00

      let amount = web3.toWei(2, 'ether')

      await h.sendTransaction({from: user1, value: amount})
      let sold = await h.tokenSold.call()

      // 1eth=>$450, buy 2eth, 65% discount
      expect(sold.toNumber()).to.be.closeTo(257142857142857142857 * 10 ** 2, 10**7)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('buyTokens', function() {
    it('should update sold tokens when sold multiple times', async function() {
      const h = await HotokenReservation.deployed()
      const user1 = accounts[1]

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00

      let amount = web3.toWei(2, 'ether')

      await h.sendTransaction({from: user1, value: amount})
      let sold = await h.tokenSold.call()

      // 1eth=>$450, buy 2eth, 65% discount
      expect(sold.toNumber()).to.be.closeTo(257142857142857142857 * 10 ** 2, 10**7)

      const user2 = accounts[2]
      await h.addToWhitelist(user1)

      // 1eth=>$450, buy 1eth, 65% discount
      await h.sendTransaction({from: user1, value: 1 * 10 ** 18})
      sold = await h.tokenSold.call()

      expect(sold.toNumber()).to.be.closeTo(385714285714285714286 * 10 ** 2, 10**7)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('buyTokens', function() {
    it('should not let owner buy tokens', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]

      await h.setPause(false)

      try {
        await h.sendTransaction({from: owner, value: 1 * 10 ** 18})
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
    it('should allow only buyer in whitelist', async function() {
      const h = await HotokenReservation.deployed()
      const user1 = accounts[1]
      const user2 = accounts[2]

      await h.setPause(false)
      await h.addToWhitelist(user1)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00

      // allowed
      await h.sendTransaction({from: user1, value: 1 * 10 ** 18})
      // not allowed
      try {
        await h.sendTransaction({from: user2, value: 1 * 10 ** 18})
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
    it('should not allow first buy lower than min purchase', async function() {
      const h = await HotokenReservation.deployed()
      const user3 = accounts[3]

      await h.setPause(false)
      await h.addToWhitelist(user3)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00

      try {
        await h.sendTransaction({from: user3, value: 1 * 10 ** 10})
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('buyTokens', function() {
    it('should not allow buying when the sale is paused', async function() {
      const h = await HotokenReservation.deployed()
      const user1 = accounts[1]

      await h.setPause(true)
      await h.addToWhitelist(user1)
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00

      try {
        await h.sendTransaction({from: user1, value: 1 * 10 ** 18})
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
  })
})
