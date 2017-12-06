const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation set minimum purchase', function(accounts) {

  it('should have initial value for minimum purchase', async function() {
    const instance = await HotokenReservation.deployed()

    const initialMinimum = (await instance.getMinimumPurchase()).toNumber()
    expect(initialMinimum).to.be.equal(300)
  })

  it('should be able to get value for minimum purchase by not owner contract', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]

    const initialMinimum = (await instance.getMinimumPurchase({from: user1})).toNumber()
    expect(initialMinimum).to.be.equal(300)
  })

  it('should be able to set minimum purchase value', async function() {
    const instance = await HotokenReservation.deployed()
    const newMinimumPurchase = 10000
    await instance.setMinimumPurchase(newMinimumPurchase)

    const currentMinimum = (await instance.getMinimumPurchase()).toNumber()
    expect(currentMinimum).to.be.equal(newMinimumPurchase)
  })

  it('should not be able to set minimum purchase value if not call by owner contract', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const currentMinimumPurchase = (await instance.getMinimumPurchase()).toNumber()
    const newMinimumPurchase = 200
    try {
      await instance.setMinimumPurchase(newMinimumPurchase, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const AfterMinimum = (await instance.getMinimumPurchase()).toNumber()
    expect(AfterMinimum).to.be.equal(currentMinimumPurchase)
  })
})