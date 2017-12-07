const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

/*
contract('HotokenReservation, refund ether', function(accounts) {
  let hotoken
  const user1 = accounts[1]

  beforeEach(async function() {
    hotoken = await HotokenReservation.new()

    await hotoken.setPause(false)
    await hotoken.addToWhitelist(user1)

    const amountEther = 1
    const amountWei = web3.toWei(amountEther, 'ether')

    await hotoken.sendTransaction({from: user1, value: amountWei})
  })

  it('should not be able to transfer refund if pause state is true', async function() {
    await hotoken.setPause(true)

    try {
      await hotoken.refund({from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to transfer refund if sale is not finished', async function() {
    await hotoken.setPause(false)
    await hotoken.setSaleFinished(true)

    try {
      await hotoken.refund({from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to transfer refund for owner', async function() {
    await hotoken.setPause(false)
    await hotoken.setSaleFinished(true)

    try {
      await hotoken.refund()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  // TODO
  it('should not be able to transfer refund if not reach minimumSold', async function() {
    await hotoken.setPause(false) // need to change after can calculate soldAmount
    await hotoken.setSaleFinished(true)

    try {
      await hotoken.refund({from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to transfer refund if not in the whitelist', async function() {
    await hotoken.setPause(false)
    await hotoken.setSaleFinished(true)
    await hotoken.removeFromWhiteList(user1)

    try {
      await hotoken.refund({from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to transfer refund if not exist in the ledger', async function() {
    const user2 = accounts[2]

    await hotoken.setPause(false)
    await hotoken.setSaleFinished(true)
    await hotoken.addToWhitelist(user2)

    try {
      await hotoken.refund({from: user2})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should be able to transfer refund', async function() {
    await hotoken.setPause(false)
    await hotoken.setSaleFinished(true)
    await hotoken.addToWhitelist(user1)

    const user1EtherBefore = (await web3.eth.getBalance(user1)).toNumber()
    const user1RefundAmount = (await hotoken.ethAmount.call(user1)).toNumber()
    const tx = await hotoken.refund({from: user1})
    const user1EtherAfter = (await web3.eth.getBalance(user1)).toNumber()

    expect(user1EtherAfter).to.be.above(user1EtherBefore)

    // test event RefundTransfer
    expect(tx.logs).to.be.ok
    expect(tx.logs[0].event).to.be.equal('RefundTransfer')
    expect(tx.logs[0].args._backer).to.be.equal(user1)
    expect(tx.logs[0].args._amount.toNumber()).to.be.equal(user1RefundAmount)
  })
})
*/
