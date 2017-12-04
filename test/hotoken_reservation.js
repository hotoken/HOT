const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {

  it('should be able to deployed', async function() {
    const instance = await HotokenReservation.deployed()
    expect(instance).to.be.ok
  })

  it('should create empty whitelist', async function() {
    const instance = await HotokenReservation.deployed()
    expect(instance.whitelist).to.be.ok
  })

  it('should be able to add new adress to whitelist', async function() {
    const newAccount = accounts[1]
    const instance = await HotokenReservation.deployed()
    const result = await instance.addToWhitelist(newAccount)
    expect(result).to.be.ok
    expect(result).to.be.not.empty
    expect(Object.keys(result)).to.have.lengthOf(3)
    expect(result.receipt.status).to.be.equal(1)
  })

  it('should be able check address in the whitelist', async function() {
    const account = accounts[1]
    const instance = await HotokenReservation.deployed()
    const exists = await instance.whitelist.call(account)
    expect(exists.toNumber()).to.equal(1)
  })

  it('should be able check address in the whitelist via external method', async function() {
    const account = accounts[1]
    const instance = await HotokenReservation.deployed()
    const exists = await instance.existsInWhitelist(account, {from: account})
    expect(exists.toNumber()).to.equal(1)
  })

  it('should be able to add many new addresses to the whitelist', async function() {
    const newAccounts = [accounts[2], accounts[3], accounts[4]]
    const instance = await HotokenReservation.deployed()
    const result = await instance.addManyToWhitelist(newAccounts)
    expect(result).to.be.ok
    expect(result).to.be.not.empty
    expect(Object.keys(result)).to.have.lengthOf(3)
    expect(result.receipt.status).to.be.equal(1)
    expect((await instance.whitelist.call(newAccounts[0])).toNumber()).to.be.equal(1)
    expect((await instance.whitelist.call(newAccounts[1])).toNumber()).to.be.equal(1)
    expect((await instance.whitelist.call(newAccounts[2])).toNumber()).to.be.equal(1)
  })

  it('should be able to remove address from whitelist', async function() {
    const account = accounts[1]
    const instance = await HotokenReservation.deployed()
    await instance.removeFromWhiteList(account)
    const exists = await instance.whitelist.call(account)
    expect(exists.toNumber()).to.equal(0)
  })

  it('should be able to remove many addresses from whitelist', async function() {
    const listOfAccounts = [accounts[2], accounts[3], accounts[4]]
    const instance = await HotokenReservation.deployed()
    await instance.removeManyFromWhitelist(accounts)
    expect((await instance.whitelist.call(listOfAccounts[0])).toNumber()).to.be.equal(0)
    expect((await instance.whitelist.call(listOfAccounts[1])).toNumber()).to.be.equal(0)
    expect((await instance.whitelist.call(listOfAccounts[2])).toNumber()).to.be.equal(0)
  })

  it('should not be able to add address to whitelist if caller is not the owner', async function() {
    const newAccount = accounts[1]
    const instance = await HotokenReservation.deployed()
    try {
      await instance.addToWhitelist(newAccount, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to add many addresses to whitelist if caller is not the owner', async function() {
    const newAccounts = [accounts[2], accounts[3], accounts[4]]
    const instance = await HotokenReservation.deployed()
    try {
      await instance.addManyToWhitelist(newAccounts, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to remove address to whitelist if caller is not the owner', async function() {
    const account = accounts[1]
    const instance = await HotokenReservation.deployed()
    try {
      await instance.removeFromWhiteList(account, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to remove many addresses to whitelist if caller is not the owner', async function() {
    const listOfAccounts = [accounts[2], accounts[3], accounts[4]]
    const instance = await HotokenReservation.deployed()
    try {
      await instance.removeManyFromWhitelist(accounts, {from: accounts[2]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})

// contract('HotokenReservation buy token', function(accounts) {

//   it('should be able to retrieve 2 ether for contributor that is in the whitelist', async function() {
//     const instance = await HotokenReservation.deployed()
//     const user1 = accounts[1]
//     const rate = (await instance.rate.call()).toNumber()
//     await instance.addToWhitelist(user1)

//     expect((await instance.whitelist.call(user1)).toNumber()).to.be.equal(1)

//     const amountEther = 2
//     const amountWei = web3.toWei(amountEther, 'ether')

//     const ownerEtherBefore = (await web3.eth.getBalance(accounts[0])).toNumber()
//     const tokenSoldBefore = (await instance.tokenSold.call()).toNumber()

//     await instance.sendTransaction({from: user1, value: amountWei})
//     const user1BalanceAfter = (await instance.balanceOf(user1)).toNumber()
//     const ownerEtherAfter = (await web3.eth.getBalance(accounts[0])).toNumber()
//     const tokenSoldAfter = (await instance.tokenSold.call()).toNumber()

//     expect(user1BalanceAfter).to.be.equal(rate * amountWei)
//     expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
//     expect(tokenSoldAfter).to.be.equal(Number(tokenSoldBefore + (rate * amountWei)))
    
//   })

//   it('should not be able to retrieve ether from address that it is not in the whitelist', async function() {
//     const instance = await HotokenReservation.deployed()

//     const user2 = accounts[2]
//     const rate = (await instance.rate.call()).toNumber()
//     expect((await instance.whitelist.call(user2)).toNumber()).to.be.equal(0)

//     const amountEther = 2
//     const amountWei = web3.toWei(amountEther, 'ether')
//     const tokenSold = (await instance.tokenSold.call()).toNumber()

//     try {
//       await instance.sendTransaction({from: user2, value: amountWei})
//     } catch (e) {
//       expect(e.toString()).to.be.include('revert')
//     }
//     expect(tokenSold).to.be.equal(Number(rate * amountWei))
//   })

//   it('should not be able to retrieve ether from owner contract address', async function() {
//     const instance = await HotokenReservation.deployed()
//     const rate = (await instance.rate.call()).toNumber()

//     const amountEther = 2
//     const amountWei = web3.toWei(amountEther, 'ether')

//     const ownerEtherBefore = (await web3.eth.getBalance(accounts[0])).toNumber()
//     const tokenSold = (await instance.tokenSold.call()).toNumber()

//     try {
//       await instance.sendTransaction({from: accounts[0], value: amountWei})
//     } catch (e) {
//       expect(e.toString()).to.be.include('revert')
//     }
//     expect(tokenSold).to.be.equal(Number(rate * amountWei))
//   })

//   it('should be able to log event if send ether success', async function() {
//     const instance = await HotokenReservation.deployed()
//     const user2 = accounts[2]
//     const rate = (await instance.rate.call()).toNumber()
//     await instance.addToWhitelist(user2)

//     const amountEther = 5
//     const amountWei = web3.toWei(amountEther, 'ether')

//     const ownerEtherBefore = (await web3.eth.getBalance(accounts[0])).toNumber()
//     const tokenSoldBefore = (await instance.tokenSold.call()).toNumber()

//     const tx = await instance.sendTransaction({from: user2, value: amountWei})
//     const user2BalanceAfter = (await instance.balanceOf(user2)).toNumber()
//     const ownerEtherAfter = (await web3.eth.getBalance(accounts[0])).toNumber()
//     const tokenSoldAfter = (await instance.tokenSold.call()).toNumber()

//     expect(user2BalanceAfter).to.be.equal(rate * amountWei)
//     expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
//     expect(tokenSoldAfter).to.be.equal(Number(tokenSoldBefore + (rate * amountWei)))

//     // check events log
//     expect(tx.logs).to.be.ok
//     expect(tx.logs[0].event).to.be.equal('TokenPurchase')
//     expect(tx.logs[0].args.purchaser).to.be.equal(user2)
//     expect(tx.logs[0].args.beneficiary).to.be.equal(user2)
//     expect(tx.logs[0].args.value.toNumber()).to.be.equal(Number(amountWei))
//     expect(tx.logs[0].args.amount.toNumber()).to.be.equal(rate * amountWei)
//   })
// })

contract('HotokenReservation set discount rate', function(accounts) {
  
  it('initial discount rate should be zero discount rate', async function() {
    const instance = await HotokenReservation.deployed()
    const discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(0)
  })

  it('should be able to set discount by contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    await instance.setDiscountRate(3)
    const discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(30)
  })

  it('should not be able to set discount that more than 30%', async function() {
    const instance = await HotokenReservation.deployed()
    try {
      await instance.setDiscountRate(4)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const discountRate = (await instance.getDiscountRate()).toNumber()
    // should be the same as above that we set to 30%
    expect(discountRate).to.be.equal(30)
  })

  it('should not be able to set discount if not call by contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    try {
      await instance.setDiscountRate(2, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})

contract('HotokenReservation set usd rate', function(accounts) {
  
  it('should have initial value for usd rate map', async function() {
    const instance = await HotokenReservation.deployed()

    const ETHRate = (await instance.getUSDRate("ETH")).toNumber()
    const BTCRate = (await instance.getUSDRate("BTC")).toNumber()
    const USDRate = (await instance.getUSDRate("USD")).toNumber()

    expect(ETHRate).to.be.equal(400)
    expect(BTCRate).to.be.equal(11000)
    expect(USDRate).to.be.equal(1)
  })

  it('should be able to set usd rate for any currency', async function() {
    const instance = await HotokenReservation.deployed()
    await instance.setUSDRate("ETH", 500)
    await instance.setUSDRate("BTC", 12000)
    await instance.setUSDRate("USD", 12)

    const ETHRate = (await instance.getUSDRate("ETH")).toNumber()
    const BTCRate = (await instance.getUSDRate("BTC")).toNumber()
    const USDRate = (await instance.getUSDRate("USD")).toNumber()

    expect(ETHRate).to.be.equal(500)
    expect(BTCRate).to.be.equal(12000)
    expect(USDRate).to.be.equal(12)
  })

  it('should be able to get usd rate for currency that not put into map', async function() {
    const instance = await HotokenReservation.deployed()

    try {
      const UnknownCoinRate = (await instance.getUSDRate("UNKNOWN")).toNumber()
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to set usd rate for any currency if not call by contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]

    const ETHRateBefore = (await instance.getUSDRate("ETH")).toNumber()
    const BTCRateBefore = (await instance.getUSDRate("BTC")).toNumber()
    const USDRateBefore = (await instance.getUSDRate("USD")).toNumber()

    try {
      await instance.setUSDRate("ETH", 600, {from: user1})
      await instance.setUSDRate("BTC", 13000, {from: user1})
      await instance.setUSDRate("USD", 20, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const ETHRateAfter = (await instance.getUSDRate("ETH")).toNumber()
    const BTCRateAfter = (await instance.getUSDRate("BTC")).toNumber()
    const USDRateAfter = (await instance.getUSDRate("USD")).toNumber()

    // should be the same as above that we set ETH => 500, BTC => 12000, USD => 12
    expect(ETHRateAfter).to.be.equal(ETHRateBefore)
    expect(BTCRateAfter).to.be.equal(BTCRateBefore)
    expect(USDRateAfter).to.be.equal(USDRateBefore)
  })
})

contract('HotokenReservation set minimum purchase', function(accounts) {

  it('should have initial value for minimum purchase', async function() {
    const instance = await HotokenReservation.deployed()

    const initialMinimum = (await instance.getMinimumPurchase()).toNumber()
    expect(initialMinimum).to.be.equal(50000)
  })

  it('should be able to get value for minimum purchase by not owner contract', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]

    const initialMinimum = (await instance.getMinimumPurchase({from: user1})).toNumber()
    expect(initialMinimum).to.be.equal(50000)
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

contract('HotokenReservation set pause state', function(accounts) {

  it('should have initial value for pause state after contract deployed', async function() {
    const instance = await HotokenReservation.deployed()
    const isPauseEnabled = (await instance.isPauseEnabled())
    expect(isPauseEnabled).to.be.false
  })

  it('should be able to set pause state', async function() {
    const instance = await HotokenReservation.deployed()
    const isPauseEnabledBefore = (await instance.isPauseEnabled())
    expect(isPauseEnabledBefore).to.be.false

    await instance.setPauseEnabled(true)
    const isPauseEnabledAfter = (await instance.isPauseEnabled())
    expect(isPauseEnabledAfter).to.be.not.equal(isPauseEnabledBefore)
    expect(isPauseEnabledAfter).to.be.true
  })

  it('should not be able to set pause state if not call by contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    const isPauseEnabledBefore = (await instance.isPauseEnabled())
    const user1 = accounts[1]

    try {
      await instance.setPauseEnabled(true)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const isPauseEnabledAfter = (await instance.isPauseEnabled())
    expect(isPauseEnabledAfter).to.be.equal(isPauseEnabledBefore)
  })
})
  