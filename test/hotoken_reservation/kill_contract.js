const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation') 

contract('HotokenReservation, kill contract by owner account', function(accounts) {
  let hotoken
  
  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it('should be able to kill contract and burn the unsold Token', async function() {
    await hotoken.kill()
    expect((await hotoken.owner.call())).to.be.equal("0x0")
  })

  it('should not be able to kill contract again if killed already', async function() {
    await hotoken.kill()

    try {
      await hotoken.kill()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to kill contract if not call by owner', async function() {
    const user1 = accounts[1]

    try {
      await hotoken.kill({from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})