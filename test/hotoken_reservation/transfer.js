const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation transfer token', function(accounts) {

  it('should be able to transfer token', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    await instance.setPause(true)

    await instance.transfer(user1, 1000)
    expect((await instance.balanceOf(user1)).toNumber()).to.be.equal(1000)
  })

  it('should not be able transfer token by not owner address', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const user2 = accounts[2]

    try {
      await instance.transfer(user2, 1000, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able transfer token to 0x address', async function() {
    const instance = await HotokenReservation.deployed()

    try {
      await instance.transfer("0x0", 1000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able transfer token to owner contract itself', async function() {
    const instance = await HotokenReservation.deployed()

    try {
      await instance.transfer(accounts[0], 1000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to transfer token when pause is disabled', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    await instance.setPause(false)

    try {
      await instance.transfer(user1, 1000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})