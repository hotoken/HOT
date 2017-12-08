const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {
  describe('burn', function() {
    it('total supply should equal to token sold', async function() {
      const h = await HotokenReservation.deployed()
      const user1 = accounts[1]

      await h.setPause(false)
      await h.addToWhitelist(user1)
      await h.setConversionRate('ETH', 50000)
      await h.setDiscountRate(0) // no discount
      await h.sendTransaction({from: user1, value: 10 * 10 ** 18})
      await h.setSaleFinished(true)

      const totalSupplyBefore = await h.totalSupply.call()
      expect(totalSupplyBefore.toNumber()).to.be.equal(3000000000 * 10 ** 18)

      const tokenSold = await h.tokenSold.call()
      expect(tokenSold.toNumber()).to.be.equal(50000 * 10 ** 18)

      const tx = await h.burn()

      const totalSupplyAfter = await h.totalSupply.call()
      expect(totalSupplyAfter.toNumber()).to.be.equal(50000 * 10 ** 18)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('burn', function() {
    it('should remove owner balance', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      let ownerBalance = await h.balanceOf(owner)
      expect(ownerBalance.toNumber()).to.be.equal(3000000000 * 10 ** 18)

      await h.setPause(false)
      await h.addToWhitelist(user1)
      await h.setConversionRate('ETH', 50000)
      await h.setDiscountRate(0) // no discount
      await h.sendTransaction({from: user1, value: 10 * 10 ** 18})
      await h.setSaleFinished(true)

      ownerBalance = await h.balanceOf(owner)
      expect(ownerBalance.toNumber()).to.be.equal(2999950000 * 10 ** 18)

      const tx = await h.burn()

      ownerBalance = await h.balanceOf(owner)
      expect(ownerBalance.toNumber()).to.be.equal(0)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('burn', function() {
    it('should fire burn event', async function() {
      const h = await HotokenReservation.deployed()
      const user1 = accounts[1]

      await h.setPause(false)
      await h.addToWhitelist(user1)
      await h.setConversionRate('ETH', 50000)
      await h.setDiscountRate(0) // no discount
      await h.sendTransaction({from: user1, value: 10 * 10 ** 18})
      await h.setSaleFinished(true)

      const tx = await h.burn()

      expect(tx.logs).to.be.ok
      expect(tx.logs[0].event).to.be.equal('Burn')
      expect(tx.logs[0].args.burner).to.be.equal(accounts[0])
      expect(tx.logs[0].args.value.toNumber()).to.be.equal(2999950000 * 10 ** 18)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('burn', function() {
    it('should not be able to burn tokens if not call by another address', async function() {
      const h = await HotokenReservation.deployed()
      const user1 = accounts[1]

      await h.setPause(false)
      await h.addToWhitelist(user1)
      await h.setConversionRate('ETH', 50000)
      await h.setDiscountRate(0) // no discount
      await h.setSaleFinished(true)

      await h.setSaleFinished(true)
      try {
        await h.burn({from: user1})
        expect.fail()
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
    it('should not be able to burn tokens if sale finish flag is false', async function() {
      const h = await HotokenReservation.deployed()

      await h.setPause(false)
      await h.setConversionRate('ETH', 50000)
      await h.setDiscountRate(0) // no discount
      await h.setSaleFinished(true)

      await h.setSaleFinished(false)
      try {
        await h.burn()
        expect.fail()
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
  })
})
