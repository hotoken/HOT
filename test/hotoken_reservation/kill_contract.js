const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {
  describe('kill contract', function() {
    let h
    const owner = accounts[0]
    const user1 = accounts[1]

    beforeEach(async function() {
      h = await HotokenReservation.new()

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionRate(45000) // 1ETH = $450.00
      await h.setDiscountRate(1) // 25%
    })

    it('should not be able to kill if sale is not finished', async function() {
      let amount = web3.toWei(2, 'ether')
      await h.sendTransaction({from: user1, value: amount})

      await h.setSaleFinished(false)

      try {
        await h.kill()
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to kill contract if not call by owner', async function() {
      let amount = web3.toWei(2, 'ether')
      await h.sendTransaction({from: user1, value: amount})

      await h.setSaleFinished(true)
      await h.withDrawOnlyOwner()

      try {
        await h.kill({from: user1})
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to kill contract if owner not withdraw the balances', async function() {
      let amount = web3.toWei(2, 'ether')
      await h.sendTransaction({from: user1, value: amount})

      await h.setSaleFinished(true)

      try {
        await h.kill()
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to kill contract twice', async function() {
      let amount = web3.toWei(2, 'ether')
      await h.sendTransaction({from: user1, value: amount})

      await h.setSaleFinished(true)
      await h.withDrawOnlyOwner()
      await h.kill()

      try {
        await h.kill()
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('kill contract', function() {
    it('should be able to kill contract', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionRate(45000) // 1ETH = $450.00
      await h.setDiscountRate(1) // 25%

      let amount = web3.toWei(2, 'ether')
      await h.sendTransaction({from: user1, value: amount})

      await h.setSaleFinished(true)

      const contractBalanceBefore = (await web3.eth.getBalance(h.address)).toNumber()
      await h.withDrawOnlyOwner()
      const contractBalanceAfter = (await web3.eth.getBalance(h.address)).toNumber()
      await h.kill()

      expect((await h.owner.call())).to.be.equal("0x0")
      expect(contractBalanceAfter).to.be.below(contractBalanceBefore)
      expect(contractBalanceAfter).to.be.equal(0)
    })
  })
})