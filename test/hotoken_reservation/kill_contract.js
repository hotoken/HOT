const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation') 

contract('HotokenReservation, kill contract by owner account', function(accounts) {
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

  it('should not be able to kill contract if sale is not finished', async function() {
    try {
      await hotoken.kill()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to kill contract if not call by owner', async function() {
    await hotoken.setSaleFinished(true)
    await hotoken.withDrawOnlyOwner()
    
    try {
      await hotoken.kill({from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to kill contract again if killed already', async function() {
    await hotoken.setSaleFinished(true)
    await hotoken.withDrawOnlyOwner()
    await hotoken.kill()

    try {
      await hotoken.kill()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to kill contract if eth amount of this smart contract not 0 [not withdraw to another address]', async function() {
    await hotoken.setSaleFinished(true)
    try {
      await hotoken.kill()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should be able to kill contract', async function() {
    await hotoken.setSaleFinished(true)
    await hotoken.withDrawOnlyOwner()
    await hotoken.kill()
    expect((await hotoken.owner.call())).to.be.equal("0x0")
  })
})