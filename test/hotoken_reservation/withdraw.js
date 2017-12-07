const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

/*
contract('HotokenReservation, withdraw', function(accounts) {
  let hotoken
  const owner = accounts[0]
  const user1 = accounts[1]

  beforeEach(async function() {
    hotoken = await HotokenReservation.new()

    await hotoken.setPause(false)
    await hotoken.addToWhitelist(user1)

    const amountEther = 1
    const amountWei = web3.toWei(amountEther, 'ether')

    await hotoken.sendTransaction({from: user1, value: amountWei})
  })

  it('should not be able to withdraw if not call by owner', async function() {
    try {
      await hotoken.withDrawOnlyOwner()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to withdraw if sale is not finished', async function() {
    await hotoken.setSaleFinished(false)

    try {
      await hotoken.withDrawOnlyOwner()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should be able to withdraw', async function() {
    await hotoken.setSaleFinished(true)

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const contractEtherBefore = (await web3.eth.getBalance(hotoken.address)).toNumber()

    const tx = await hotoken.withDrawOnlyOwner()

    const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
    const contractEtherAfter = (await web3.eth.getBalance(hotoken.address)).toNumber()

    expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
    expect(contractEtherAfter).to.be.equal(0)

    // test event RefundTransfer
    expect(tx.logs).to.be.ok
    expect(tx.logs[0].event).to.be.equal('WithdrawOnlyOwner')
    expect(tx.logs[0].args._owner).to.be.equal(owner)
    expect(tx.logs[0].args._amount.toNumber()).to.be.equal(contractEtherBefore)
  })
})
*/
