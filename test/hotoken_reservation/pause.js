const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation set pause state', function(accounts) {

  it('should have initial value for pause state after contract deployed', async function() {
    const instance = await HotokenReservation.deployed()
    const isPause = (await instance.isPause())
    expect(isPause).to.be.true
  })

  it('should be able to set pause state', async function() {
    const instance = await HotokenReservation.deployed()
    const isPauseBefore = (await instance.isPause())
    expect(isPauseBefore).to.be.true

    await instance.setPause(false)
    const isPauseAfter = (await instance.isPause())
    expect(isPauseAfter).to.be.not.equal(isPauseBefore)
    expect(isPauseAfter).to.be.false
  })

  it('should not be able to set pause state if not call by contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    const isPauseBefore = (await instance.isPause())
    const user1 = accounts[1]

    try {
      await instance.setPause(true, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const isPauseAfter = (await instance.isPause())
    expect(isPauseAfter).to.be.equal(isPauseBefore)
  })
})