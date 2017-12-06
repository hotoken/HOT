const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation, burn tokens', function(accounts) {
  
    it('should be able to burn tokens', async function() {
      const instance = await HotokenReservation.deployed()
  
      // For increase tokenSold
      const user1 = accounts[1]
      
      await instance.setPause(false)
      // add to whitelist first
      await instance.addToWhitelist(user1)
  
      const amountEther = 1
      const amountWei = web3.toWei(amountEther, 'ether')
  
      await instance.sendTransaction({from: user1, value: amountWei})
  
      // Finish Sale
      await instance.setSaleFinished(true)
      await instance.burn()
  
      // expect((await instance.totalSupply.call()).toNumber()).to.be.equal(3000000000000000000000000000 - 6600000000000000000000)
      expect((await instance.balanceOf.call(accounts[0])).toNumber()).to.be.equal(0)
  
      // need to check balance of owner
    })
  })
  
  contract('HotokenReservation, burn tokens', function(accounts) {
    
    it('should not be able to burn tokens if not call by another address', async function() {
      const instance = await HotokenReservation.deployed()
  
      // Finish Sale
      await instance.setSaleFinished(true)
      try {
        await instance.burn({from: accounts[1]})
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
  
    it('should not be able to burn tokens if sale finish flag is false', async function() {
      const instance = await HotokenReservation.deployed()
      
      // Finish Sale
      await instance.setSaleFinished(false)
      try {
        await instance.burn()
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })
  })