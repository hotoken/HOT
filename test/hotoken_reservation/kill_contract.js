const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation') 

contract('HotokenReservation, kill contract by owner account', function(accounts) {

  it('should be able to kill contract and burn the unsold Token', async function() {
    const instance = await HotokenReservation.deployed()

    await instance.kill()
    expect((await instance.owner.call())).to.be.equal("0x0")
  })

  it('should not be able to kill contract again if killed already', async function() {
    const instance = await HotokenReservation.deployed()

    try {
      await instance.kill()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})

contract('HotokenReservation, kill contract by not owner account', function(accounts) {
  
  it('should not be able to kill contract', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]

    try {
      await instance.kill({from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})