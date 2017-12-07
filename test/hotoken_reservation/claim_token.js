const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function() {
  describe('claimTokens', function() {
    it('should not be able to claim tokens when pause the sale', async function() {
    })
  })
})


/*
contract('HotokenReservation claim tokens', function(accounts) {
  let hotoken
  const user1 = accounts[1]

  before(async function () {
    hotoken = await HotokenReservation.new();

    await hotoken.setPause(true)
    await hotoken.setSaleFinished(true)
    await hotoken.addToWhitelist(user1)
  });

  it('should not be able to claim tokens when pause the sale', async function() {
    try {
      await hotoken.claimTokens("anotherAddress", {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to claim tokens when sale is not end', async function() {
    await hotoken.setPause(false)

    try {
      await hotoken.claimTokens("anotherAddress", {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })


  it('should not be able to claim tokens when sale not reach minimum sold', async function() {
    await hotoken.setPause(false)
    await hotoken.setSaleFinished(false)
    await hotoken.addToWhitelist(user1)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    await hotoken.sendTransaction({from: user1, value: amountWei})

    try {
      await hotoken.claimTokens("anotherAddress", {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to claim tokens via contract owner', async function() {
    const owner = accounts[0]
    await hotoken.setPause(false)
    await hotoken.addToWhitelist(owner)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    // owner cannot claim token
    try {
      await hotoken.claimTokens("anotherAddress", {from: owner})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to claim tokens if it is not in the whitelist', async function() {
    const user5 = accounts[5]

    await hotoken.setPause(false)
    await hotoken.setSaleFinished(true)

    try {
      await hotoken.claimTokens("anotherAddress", {from: user5})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should be able to get newAddress that map with the sender address', async function() {
    const user2 = accounts[2]

    await hotoken.setPause(false)
    await hotoken.setSaleFinished(true)
    await hotoken.addToWhitelist(user1)
    await hotoken.addToWhitelist(user2)

    // await hotoken.setMinimumSold(1)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    await hotoken.sendTransaction({from: user1, value: amountWei})
    await hotoken.sendTransaction({from: user2, value: amountWei})

    await hotoken.claimTokens("anotherAddress", {from: user1})

    let addressMap = await hotoken.getAddressfromClaimTokens({from: user1})
    expect(addressMap).to.be.equal("anotherAddress")

    addressMap = await hotoken.getAddressfromClaimTokens({from: user2})
    expect(addressMap).to.be.equal("")
    expect(addressMap).to.be.empty
  })

  it.skip('should not be able to get list of claim tokens from many address in whitelist if not call by owner', async function() {
    const user2 = accounts[2]

    await hotoken.setPause(false)
    await hotoken.setSaleFinished(true)
    await hotoken.addToWhitelist(user1)
    await hotoken.addToWhitelist(user2)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    await hotoken.sendTransaction({from: user1, value: amountWei})
    await hotoken.sendTransaction({from: user2, value: amountWei})

    await hotoken.claimTokens("anotherAddress", {from: user1})

    const whitelist = [user1, user2]

    const listOfClaim = await hotoken.getClaimAddressFromManyAddresses()
    console.log(listOfClaim)
  })

  it.skip('should be able to get list of claim tokens from many address in whitelist', async function() {
    const user2 = accounts[2]

    await hotoken.setPause(false)
    await hotoken.setSaleFinished(true)
    await hotoken.addToWhitelist(user1)
    await hotoken.addToWhitelist(user2)

    // await hotoken.setMinimumSold(1)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    await hotoken.sendTransaction({from: user1, value: amountWei})
    await hotoken.sendTransaction({from: user2, value: amountWei})

    await hotoken.claimTokens("anotherAddress", {from: user1})

    const listOfClaim = await hotoken.getListOfClaimTokens()
    expect(listOfClaim).to.be.include('eth_address,htkn_address')
    console.log(listOfClaim)
  })

  it('should be able to check that user claim tokens already or not', async function() {
    const user2 = accounts[2]

    const exists = await hotoken.alreadyClaimTokens({from: user2})
    expect(exists).to.be.false
  })
})
*/
