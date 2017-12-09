const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {
  describe('claimTokens', function() {
    it('should not be able to claim tokens when pause the sale', async function() {
      const user1 = accounts[1]

      const h = await HotokenReservation.deployed()
      await h.setPause(true)
      await h.addToWhitelist(user1)
      await h.setMinimumSold(0)
      await h.setSaleFinished(true)

      try {
        await h.claimTokens("0x12345678", {from: user1})
        expect.fail()
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to claim tokens when sale is not end', async function() {
      const user1 = accounts[1]

      const h = await HotokenReservation.deployed()
      await h.setPause(false)
      await h.addToWhitelist(user1)
      await h.setMinimumSold(0)

      // You can buy
      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00
      await h.sendTransaction({from: user1, value: 1 * 10 ** 18})

      await h.setSaleFinished(false)

      // You cannot claim yet
      try {
        await h.claimTokens("0x12345678", {from: user1})
        expect.fail()
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to claim tokens when sale not reach minimum sold', async function() {
      const user1 = accounts[1]

      const h = await HotokenReservation.deployed()
      await h.setPause(false)
      await h.addToWhitelist(user1)
      await h.setDiscountRate(0)
      await h.setMinimumSold(2 * (10**6))

      // just one ETH sold
      await h.setConversionToUSDCentsRate(50000)
      await h.sendTransaction({from: user1, value: 1 * 10 ** 18})
      await h.setSaleFinished(true)

      try {
        await h.claimTokens("0x12345678", {from: user1})
        expect.fail()
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to claim tokens via contract owner', async function() {
      const owner = accounts[0]

      const h = await HotokenReservation.deployed()
      await h.setPause(false)
      await h.setDiscountRate(0)
      await h.setMinimumSold(0)
      await h.setSaleFinished(true)

      try {
        await h.claimTokens("0x12345678", {from: owner})
        expect.fail()
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('the claimer should be in the whitelist', async function() {
      const user2 = accounts[2]

      const h = await HotokenReservation.deployed()
      await h.setPause(false)
      await h.setDiscountRate(0)
      await h.setMinimumSold(0)
      await h.setSaleFinished(true)

      try {
        await h.claimTokens("0x12345678", {from: user2})
        expect.fail()
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should store claimed address', async function() {
      const user1 = accounts[1]

      const h = await HotokenReservation.deployed()
      await h.setPause(false)
      await h.setDiscountRate(0)
      await h.setMinimumSold(0)
      await h.setConversionToUSDCentsRate(50000)
      await h.addToWhitelist(user1)
      await h.sendTransaction({from: user1, value: 1 * 10 ** 18})
      await h.setSaleFinished(true)
      await h.claimTokens("0x12345678", {from: user1})
      const addr = await h.claimTokenMap.call(user1)
      expect(addr).to.be.equal("0x12345678")
    })
  })
})
