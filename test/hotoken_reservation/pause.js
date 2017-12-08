const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation set pause state', function(accounts) {
  let hotoken
  
  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it('should have initial value for pause state after contract deployed', async function() {
    const isPause = await hotoken.pause.call()
    expect(isPause).to.be.true
  })

  it('should not be able to set pause state if not call by contract owner', async function() {
    const isPauseBefore = await hotoken.pause.call()
    const user1 = accounts[1]

    try {
      await hotoken.setPause(true, {from: user1})
      expect.fail(true, false, 'Operation should be reverted')
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const isPauseAfter = await hotoken.pause.call()
    expect(isPauseAfter).to.be.equal(isPauseBefore)
  })

  it('should be able to set pause state', async function() {
    const isPauseBefore = await hotoken.pause.call()
    expect(isPauseBefore).to.be.true

    await hotoken.setPause(false)
    const isPauseAfter = await hotoken.pause.call()
    expect(isPauseAfter).to.be.not.equal(isPauseBefore)
    expect(isPauseAfter).to.be.false
  })
})