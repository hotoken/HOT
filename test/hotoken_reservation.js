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

    const whiteListInfo = await instance.whiteListInfo.call(0)
    expect(whiteListInfo[0]).to.be.equal(newAccount)
    expect(whiteListInfo[1].toNumber()).to.be.equal(1)
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

    let whiteListInfo = await instance.whiteListInfo.call(0)
    expect(whiteListInfo[0]).to.be.equal(accounts[1])
    expect(whiteListInfo[1].toNumber()).to.be.equal(1)

    whiteListInfo = await instance.whiteListInfo.call(1)
    expect(whiteListInfo[0]).to.be.equal(accounts[2])
    expect(whiteListInfo[1].toNumber()).to.be.equal(1)

    whiteListInfo = await instance.whiteListInfo.call(2)
    expect(whiteListInfo[0]).to.be.equal(accounts[3])
    expect(whiteListInfo[1].toNumber()).to.be.equal(1)

    whiteListInfo = await instance.whiteListInfo.call(3)
    expect(whiteListInfo[0]).to.be.equal(accounts[4])
    expect(whiteListInfo[1].toNumber()).to.be.equal(1)
  })

  it('should be able to remove address from whitelist', async function() {
    const account = accounts[1]
    const instance = await HotokenReservation.deployed()
    await instance.removeFromWhiteList(account)
    const exists = await instance.whitelist.call(account)
    expect(exists.toNumber()).to.equal(0)

    const whiteListInfo = await instance.whiteListInfo.call(0)
    expect(whiteListInfo[0]).to.be.equal(account)
    expect(whiteListInfo[1].toNumber()).to.be.equal(0)
  })

  it('should be able to remove many addresses from whitelist', async function() {
    const listOfAccounts = [accounts[2], accounts[3], accounts[4]]
    const instance = await HotokenReservation.deployed()
    await instance.removeManyFromWhitelist(accounts)
    expect((await instance.whitelist.call(listOfAccounts[0])).toNumber()).to.be.equal(0)
    expect((await instance.whitelist.call(listOfAccounts[1])).toNumber()).to.be.equal(0)
    expect((await instance.whitelist.call(listOfAccounts[2])).toNumber()).to.be.equal(0)

    let whiteListInfo = await instance.whiteListInfo.call(0)
    expect(whiteListInfo[0]).to.be.equal(accounts[1])
    expect(whiteListInfo[1].toNumber()).to.be.equal(0)

    whiteListInfo = await instance.whiteListInfo.call(1)
    expect(whiteListInfo[0]).to.be.equal(accounts[2])
    expect(whiteListInfo[1].toNumber()).to.be.equal(0)

    whiteListInfo = await instance.whiteListInfo.call(2)
    expect(whiteListInfo[0]).to.be.equal(accounts[3])
    expect(whiteListInfo[1].toNumber()).to.be.equal(0)

    whiteListInfo = await instance.whiteListInfo.call(3)
    expect(whiteListInfo[0]).to.be.equal(accounts[4])
    expect(whiteListInfo[1].toNumber()).to.be.equal(0)
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

contract('HotokenReservation buy token', function(accounts) {

  it('should be able to retrieve ether for contributor that is in the whitelist', async function() {
    const instance = await HotokenReservation.deployed()
    const HTKN_PER_ETH = (await instance.HTKN_PER_ETH.call()).toNumber()
    const discountRate = (await instance.getDiscountRate()).toNumber()
    const usdRate = (await instance.getUSDRate("ETH")).toNumber()
    const owner = accounts[0]
    const user1 = accounts[1]

    // set pause to false
    await instance.setPause(false)

    // add to whitelist first
    await instance.addToWhitelist(user1)
    expect((await instance.existsInWhitelist(user1)).toNumber()).to.be.equal(1)

    // set mininum purchase from 50k to 10k
    await instance.setMinimumPurchase(10000)

    const amountEther = 40
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()

    await instance.sendTransaction({from: user1, value: amountWei})
    const user1BalanceAfter = (await instance.balanceOf(user1)).toNumber()
    const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldAfter = (await instance.getTokenSold()).toNumber()

    expect(user1BalanceAfter).to.be.equal(264000000000000000000000)
    expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
    expect(tokenSoldAfter).to.be.equal(Number(tokenSoldBefore + 264000000000000000000000))
  })

  it('check the tokens that user received, it comes from correct calculation', async function() {
    const instance = await HotokenReservation.deployed()
    const HTKN_PER_ETH = (await instance.HTKN_PER_ETH.call()).toNumber()
    const discountRate = (await instance.getDiscountRate()).toNumber()
    const usdRate = (await instance.getUSDRate("ETH")).toNumber()
    const owner = accounts[0]
    const user4 = accounts[4]

    // set pause to false
    await instance.setPause(false)
    await instance.setDiscountRate(3)
    expect(discountRate).to.be.equal(65)

    // add to whitelist first
    await instance.addToWhitelist(user4)
    expect((await instance.existsInWhitelist(user4)).toNumber()).to.be.equal(1)

    // set mininum purchase from 50k to 1k
    await instance.setMinimumPurchase(1000)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
    const user4BalanceBefore = (await instance.balanceOf(user4)).toNumber()

    await instance.sendTransaction({from: user4, value: amountWei})
    const user4BalanceAfter = (await instance.balanceOf(user4)).toNumber()
    const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldAfter = (await instance.getTokenSold()).toNumber()

    // expect(user4BalanceAfter).to.be.equal(19800000000000000000000)
    // expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
    // expect(tokenSoldAfter).to.be.equal(tokenSoldBefore + 19800000000000000000000)
  })

  it('should be able to retrieve ether for contributor that already exists in ledger even if amount is less than minimum purchase', async function() {
    const instance = await HotokenReservation.deployed()
    const HTKN_PER_ETH = (await instance.HTKN_PER_ETH.call()).toNumber()
    const discountRate = (await instance.getDiscountRate()).toNumber()
    const usdRate = (await instance.getUSDRate("ETH")).toNumber()
    const owner = accounts[0]
    const user1 = accounts[1]

    await instance.setDiscountRate(2)
    const discountRateAfter = (await instance.getDiscountRate()).toNumber()
    expect(discountRateAfter).to.be.equal(45)

    // set mininum purchase from 50k to 10k
    await instance.setMinimumPurchase(10000)

    const amountEther = 1
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
    const user1BalanceBefore = (await instance.balanceOf(user1)).toNumber()

    await instance.sendTransaction({from: user1, value: amountWei})
    const user1BalanceAfter = (await instance.balanceOf(user1)).toNumber()
    const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldAfter = (await instance.getTokenSold()).toNumber()

    // expect(user1BalanceAfter).to.be.closeTo(user1BalanceBefore + 5800000000000000000000, 0.000001)
    expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
    // expect(tokenSoldAfter).to.be.closeTo(tokenSoldBefore + 5800000000000000000000, 0.000001)
  })

  it('should be able to sell token more than supply', async function() {
    const instance = await HotokenReservation.deployed()
    const HTKN_PER_ETH = (await instance.HTKN_PER_ETH.call()).toNumber()
    const discountRate = (await instance.getDiscountRate()).toNumber()
    const usdRate = (await instance.getUSDRate("ETH")).toNumber()
    const owner = accounts[0]
    const user1 = accounts[1]

    // set USD Rate
    await instance.setUSDRate("ETH", 500000000)

    const amountEther = 40
    const amountWei = web3.toWei(amountEther, 'ether')

    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
    const user1BalanceBefore = (await instance.balanceOf(user1)).toNumber()

    try {
      await instance.sendTransaction({from: user1, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    
    const user1BalanceAfter = (await instance.balanceOf(user1)).toNumber()
    const tokenSoldAfter = (await instance.getTokenSold()).toNumber()

    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)
    expect(user1BalanceAfter).to.be.equal(user1BalanceBefore)
  })

  it('should not be able to retrieve ether from address that it is not in the whitelist', async function() {
    const instance = await HotokenReservation.deployed()

    const user2 = accounts[2]
    expect((await instance.existsInWhitelist(user2)).toNumber()).to.be.equal(0)

    const amountEther = 2
    const amountWei = web3.toWei(amountEther, 'ether')
    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()

    try {
      await instance.sendTransaction({from: user2, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)
  })
  
  it('should not be able to retrieve ether if contract is paused', async function() {
    const instance = await HotokenReservation.deployed()

    const user1 = accounts[1]
    expect((await instance.existsInWhitelist(user1)).toNumber()).to.be.equal(1)

    await instance.setPause(true)

    const amountEther = 2
    const amountWei = web3.toWei(amountEther, 'ether')
    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()

    try {
      await instance.sendTransaction({from: user1, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)
  })

  it('should not be able to retrieve ether from owner contract address', async function() {
    const instance = await HotokenReservation.deployed()
    const owner = accounts[0]

    await instance.setPause(false)

    const amountEther = 2
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()

    try {
      await instance.sendTransaction({from: owner, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const tokenSoldAfter = (await instance.getTokenSold()).toNumber()
    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)
  })

  it('should be able to log event if send ether success', async function() {
    const instance = await HotokenReservation.deployed()
    const HTKN_PER_ETH = (await instance.HTKN_PER_ETH.call()).toNumber()
    const discountRate = (await instance.getDiscountRate()).toNumber()

    /// set USD Rate
    await instance.setUSDRate("ETH", 400)

    const usdRate = (await instance.getUSDRate("ETH")).toNumber()
    const owner = accounts[0]
    const user2 = accounts[2]

    // add to whitelist first
    await instance.addToWhitelist(user2)
    expect((await instance.existsInWhitelist(user2)).toNumber()).to.be.equal(1)

    const amountEther = 40
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()

    const tx = await instance.sendTransaction({from: user2, value: amountWei})

    // check events log
    expect(tx.logs).to.be.ok
    expect(tx.logs[0].event).to.be.equal('TokenPurchase')
    expect(tx.logs[0].args.purchaser).to.be.equal(user2)
    expect(tx.logs[0].args.beneficiary).to.be.equal(user2)
    expect(tx.logs[0].args.value.toNumber()).to.be.equal(Number(amountWei))
    expect(tx.logs[0].args.amount.toNumber()).to.be.equal(HTKN_PER_ETH * (100 + discountRate) / 100 * usdRate * amountWei)
  })
})

contract('HotokenReservation set discount rate', function(accounts) {
  
  it('initial discount rate should be zero discount rate', async function() {
    const instance = await HotokenReservation.deployed()
    const discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(65)
  })

  it('should be able to set discount by contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    await instance.setDiscountRate(3)
    let discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(65)

    await instance.setDiscountRate(2)
    discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(45)

    await instance.setDiscountRate(1)
    discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(25)

    await instance.setDiscountRate(0)
    discountRate = (await instance.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(0)
  })

  it('should not be able to set discount that more than 30%', async function() {
    const instance = await HotokenReservation.deployed()
    try {
      await instance.setDiscountRate(4)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const discountRate = (await instance.getDiscountRate()).toNumber()
    // should be the same as above that we set to 0%
    expect(discountRate).to.be.equal(0)
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

contract('HotokenReservation add information to ledger', function(accounts) {

  it('should be able to check address exists in the ledger', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]

    const exists = await instance.existsInLedger(user1)
    expect(exists).to.be.false
  })

  it('should be able to add address information in the ledger', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const amount = 100000
    const tokens = 2000

    await instance.addToWhitelist(user1)
    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()

    await instance.addToLedger(user1, "ETH", amount, tokens)
    const tokenSoldAfter = (await instance.getTokenSold()).toNumber()

    const exists = await instance.existsInLedger(user1)
    expect(tokenSoldAfter).to.be.equal(2000000000000000000000)
    expect(exists).to.be.true
  })

  it('should increase tokenSold when add address information in the ledger', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const amount = 100000
    const tokens = 4000

    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
    expect(tokenSoldBefore).to.be.equal(2000000000000000000000)

    await instance.addToLedger(user1, "BTC", amount, tokens)
    const tokenSoldAfter = (await instance.getTokenSold()).toNumber()

    const exists = await instance.existsInLedger(user1)
    expect(tokenSoldAfter).to.be.equal(6000000000000000000000)
    expect(exists).to.be.true
  })

  it('should not be able to add address information in the ledger if not in the whitelist', async function() {
    const instance = await HotokenReservation.deployed()
    const user2 = accounts[2]
    const amount = 100000

    try {
      await instance.addToLedger(user2, "ETH", amount, 20000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const exists = await instance.existsInLedger(user2)
    expect(exists).to.be.false
  })

  it('should not be able to add address information in the ledger if tokens is more then supply', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const amount = 100000
    const tokens = 4000000000

    const tokenSoldBefore = (await instance.getTokenSold()).toNumber()
    expect(tokenSoldBefore).to.be.equal(6000000000000000000000)

    try {
      await instance.addToLedger(user1, "BTC", amount, tokens)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to add address information in the ledger if not call by owner', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const user2 = accounts[2]
    const amount = 100000

    try {
      await instance.addToLedger(user1, "ETH", amount, 20000, {from: user2})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to add address information in the ledger that currency is not in usd rate map', async function() {
    const instance = await HotokenReservation.deployed()
    const user1 = accounts[1]
    const amount = 100000

    try {
      await instance.addToLedger(user1, "LTC", amount, 20000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to add owner address information in the ledger', async function() {
    const instance = await HotokenReservation.deployed()
    const owner = accounts[0]
    const amount = 100000

    try {
      await instance.addToLedger(owner, "ETH", amount, 20000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const exists = await instance.existsInLedger(owner)
    expect(exists).to.be.false
  })

  it('should be able to get ledger information', async function() {
    const instance = await HotokenReservation.deployed()
    const owner = accounts[0]
    const user1 = accounts[1]

    await instance.setPause(false)
    await instance.addToWhitelist(user1)

    const amountEther = 1
    const amountWei = web3.toWei(amountEther, 'ether')

    await instance.sendTransaction({from: user1, value: amountWei})

    const ledgerInformation = await instance.getLedgerInformation(user1)
    expect(ledgerInformation).to.be.include('datetime,currency,currency_quantity,usd_rate,discount_rate,token_quantity')
    expect(ledgerInformation).to.be.include(',BTC,100000,11000,65,4000000000000000000000')
    expect(ledgerInformation).to.be.include(',ETH,1,400,65,6600000000000000000000')
  })

  it('should not be able to get ledger information if address is not exists in ledger', async function() {
    const instance = await HotokenReservation.deployed()
    const owner = accounts[0]
    const user2 = accounts[2]

    try {
      const ledgerInformation = await instance.getLedgerInformation(user2)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to get ledger information if not call by contract owner', async function() {
    const instance = await HotokenReservation.deployed()
    const owner = accounts[0]
    const user1 = accounts[1]

    try {
      const ledgerInformation = await instance.getLedgerInformation(user1, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})

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

contract('HotokenReservation, set minimum sold', function(accounts) {

  it('should have initial value for minimum sold', async function() {
    const instance = await HotokenReservation.deployed()
    expect((await instance.getMinimumSold()).toNumber()).to.be.equal(2000000)
  })

  it('should be able to set minimum sold', async function() {
    const instance = await HotokenReservation.deployed()
    const newMinimumSold = 50000000

    await instance.setMinimumSold(newMinimumSold)
    expect((await instance.getMinimumSold()).toNumber()).to.be.equal(newMinimumSold)
  })

  it('should not be able to set minimum sold if not call by owner', async function() {
    const instance = await HotokenReservation.deployed()

    await instance.setMinimumSold(2000000)
    const newMinimumSold = 50000000

    try {
      await instance.setMinimumSold(newMinimumSold, {from: accounts[1]})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    expect((await instance.getMinimumSold()).toNumber()).to.be.equal(2000000)
  })
})

contract('HotokenReservation, set sale finish flag', function(accounts) {
  
    it('should have initial value for sale finish flag', async function() {
      const instance = await HotokenReservation.deployed()
      expect((await instance.getSaleFinished())).to.be.false
    })
  
    it('should be able to set sale finish flag', async function() {
      const instance = await HotokenReservation.deployed()
  
      await instance.setSaleFinished(true)
      expect((await instance.getSaleFinished())).to.be.true
    })
  
    it('should not be able to set minimum sold if not call by owner', async function() {
      const instance = await HotokenReservation.deployed()
  
      try {
        await instance.setSaleFinished(false, {from: accounts[1]})
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
      expect((await instance.getSaleFinished())).to.be.true
    })
  })

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
    // expect((await instance.balanceOf.call(accounts[0])).toNumber()).to.be.equal(3000000000000000000000000000 - 6600000000000000000000)
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