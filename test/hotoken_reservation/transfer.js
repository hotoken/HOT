const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation transfer token', function(accounts) {
  let hotoken

  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it('should be able to transfer token', async function() {
    const user1 = accounts[1]
    await hotoken.setPause(true)

    await hotoken.transfer(user1, 1000)
    expect((await hotoken.balanceOf(user1)).toNumber()).to.be.equal(1000)
  })

  it('should not be able transfer token by not owner address', async function() {
    const user1 = accounts[1]
    const user2 = accounts[2]

    try {
      await hotoken.transfer(user2, 1000, {from: user1})
      expect.fail()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able transfer token to 0x address', async function() {
    try {
      await hotoken.transfer("0x0", 1000)
      expect.fail()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able transfer token to owner contract itself', async function() {
    try {
      await hotoken.transfer(accounts[0], 1000)
      expect.fail()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

})
