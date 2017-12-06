const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation, burn tokens', function(accounts) {
  let hotoken

  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it.skip('should be able to burn tokens', async function() {
    // For increase tokenSold
    const user1 = accounts[1]

    await hotoken.setPause(false)
    await hotoken.addToWhitelist(user1)

    const amountEther = 1
    const amountWei = web3.toWei(amountEther, 'ether')

    await hotoken.sendTransaction({from: user1, value: amountWei})

    // Finish Sale
    await hotoken.setSaleFinished(true)
    await hotoken.burn()

    expect((await hotoken.totalSupply.call()).toNumber()).to.be.equal(3000000000000000000000000000 - 6600000000000000000000)
    expect((await hotoken.balanceOf.call(accounts[0])).toNumber()).to.be.equal(0)

    // need to check balance of owner
  })

  it('should not be able to burn tokens if not call by another address', async function() {
    // Finish Sale
    await hotoken.setSaleFinished(true)
    try {
      await hotoken.burn({from: accounts[1]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to burn tokens if sale finish flag is false', async function() {
    // Finish Sale
    await hotoken.setSaleFinished(false)
    try {
      await hotoken.burn()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})
