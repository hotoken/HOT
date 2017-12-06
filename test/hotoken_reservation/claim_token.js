const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation') 

contract('HotokenReservation claim tokens', function(accounts) {

  it('should be able to claim tokens already any time', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]

    // set pause to false
    await instance.setPause(false)

    await instance.addToWhitelist(user1)

    // set mininum purchase from 50k to 1k
    await instance.setMinimumPurchase(1000)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    // buy tokens
    await instance.sendTransaction({from: user1, value: amountWei})

    await instance.claimTokens("anotherAddress", {from: user1})
    const exists = await instance.alreadyClaimTokens({from: user1})
    const addressMap = await instance.getAddressfromClaimTokens({from: user1})

    expect(exists).to.be.true
    expect(addressMap).to.be.equal("anotherAddress")
  })

  it('should not be able to claim tokens via contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    const owner = accounts[0]

    await instance.addToWhitelist(owner)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    // owner cannot claim token
    try {
      await instance.claimTokens("anotherAddress", {from: owner})
      const exists = await instance.alreadyClaimTokens({from: owner})
      const addressMap = await instance.getAddressfromClaimTokens({from: owner})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to claim tokens if it is not in the whitelist', async function() {
    const instance = await HotokenReservation.deployed()
    const user5 = accounts[5]

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    try {
      await instance.claimTokens("anotherAddress", {from: user5})
      const exists = await instance.alreadyClaimTokens({from: user5})
      const addressMap = await instance.getAddressfromClaimTokens({from: user5})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should be able to get newAddress that map with the sender address', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const user2 = accounts[2]

    let addressMap = await instance.getAddressfromClaimTokens({from: user1})
    expect(addressMap).to.be.equal("anotherAddress")

    addressMap = await instance.getAddressfromClaimTokens({from: user2})
    expect(addressMap).to.be.equal("")
    expect(addressMap).to.be.empty
  })

  it('should be able to check that user claim tokens already or not', async function() {
    const instance = await HotokenReservation.deployed()
    const user2 = accounts[2]

    const exists = await instance.alreadyClaimTokens({from: user2})
    expect(exists).to.be.false
  })
})