const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {
  describe.only('buyTokens', function() {
    it('should be allocate buyer tokens', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionRate('ETH', 45000) // 1ETH = $450.00

      let amount = web3.toWei(2, 'ether')

      await h.sendTransaction({from: user1, value: amount})

      let user1balance = await h.balanceOf(user1)
      expect(user1balance.toNumber()).to.be.equal(14850 * 10 ** 18)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe.only('buyTokens', function() {
    it('should apply the discount rate', async function() {
      const h = await HotokenReservation.deployed()
      const owner = accounts[0]
      const user1 = accounts[1]

      await h.addToWhitelist(user1)
      await h.setPause(false)
      await h.setConversionRate('ETH', 45000) // 1ETH = $450.00
      await h.setDiscountRate(1) // 25%

      let amount = web3.toWei(2, 'ether')

      await h.sendTransaction({from: user1, value: amount})

      let user1balance = await h.balanceOf(user1)
      expect(user1balance.toNumber()).to.be.equal(11250 * 10 ** 18)
    })
  })
})

contract('HotokenReservation buy token', function(accounts) {
  let hotoken

  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })


  it.skip('should be able to retrieve ether for contributor that is in the whitelist', async function() {
    const owner = accounts[0]
    const user1 = accounts[1]

    // set pause to false
    await hotoken.setPause(false)

    // add to whitelist first
    await hotoken.addToWhitelist(user1)
    expect((await hotoken.existsInWhitelist(user1)).toNumber()).to.be.equal(1)

    // set mininum purchase from 300 to 100
    await hotoken.setMinimumPurchase(100)
    await hotoken.setUSDRate("ETH", 400)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()

    await hotoken.sendTransaction({from: user1, value: amountWei})
    const user1BalanceAfter = (await hotoken.balanceOf(user1)).toNumber()
    const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()

    expect(user1BalanceAfter).to.be.equal(4125000000000000000)
    expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
    expect(tokenSoldAfter).to.be.equal(Number(tokenSoldBefore + 264000000000000000000000))

    // need to check balance of owner
  })

  it.skip('check the tokens that user received, it comes from correct calculation', async function() {
    const owner = accounts[0]
    const user4 = accounts[4]

    // set pause to false
    await hotoken.setPause(false)
    await hotoken.setDiscountRate(3)

    const discountRate = (await hotoken.getDiscountRate()).toNumber()
    expect(discountRate).to.be.equal(65)

    // add to whitelist first
    await hotoken.addToWhitelist(user4)
    expect((await hotoken.existsInWhitelist(user4)).toNumber()).to.be.equal(1)

    // set mininum purchase from 300 to 1k
    await hotoken.setMinimumPurchase(1000)

    const amountEther = 3
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()
    const user4BalanceBefore = (await hotoken.balanceOf(user4)).toNumber()

    await hotoken.sendTransaction({from: user4, value: amountWei})
    const user4BalanceAfter = (await hotoken.balanceOf(user4)).toNumber()
    const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()

    expect(user4BalanceAfter).to.be.equal(19800000000000000000000)
    expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore + 19800000000000000000000)

    // need to check balance of owner
  })

  it.skip('should be able to retrieve ether for contributor that already exists in ledger even if amount is less than minimum purchase', async function() {
    const owner = accounts[0]
    const user1 = accounts[1]

    await hotoken.setPause(false)
    await hotoken.setDiscountRate(2)
    await hotoken.addToWhitelist(user1)

    const discountRateAfter = (await hotoken.getDiscountRate()).toNumber()
    expect(discountRateAfter).to.be.equal(45)

    // set mininum purchase from 300 to 100
    await hotoken.setMinimumPurchase(100)

    const amountEther = 4
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()
    const user1BalanceBefore = (await hotoken.balanceOf(user1)).toNumber()

    await hotoken.sendTransaction({from: user1, value: amountWei})
    const user1BalanceAfter = (await hotoken.balanceOf(user1)).toNumber()
    const ownerEtherAfter = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()

    expect(user1BalanceAfter).to.be.closeTo(user1BalanceBefore + 5800000000000000000000, 0.000001)
    expect(ownerEtherAfter).to.be.above(ownerEtherBefore)
    expect(tokenSoldAfter).to.be.closeTo(tokenSoldBefore + 5800000000000000000000, 0.000001)

    // need to check balance of owner
  })

  it('should not be able to sell token more than supply', async function() {
    const owner = accounts[0]
    const user1 = accounts[1]

    await hotoken.setPause(false)
    await hotoken.addToWhitelist(user1)
    // set USD Rate
    await hotoken.setUSDRate("ETH", 500000000)

    const amountEther = 40
    const amountWei = web3.toWei(amountEther, 'ether')

    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()
    const user1BalanceBefore = (await hotoken.balanceOf(user1)).toNumber()

    try {
      await hotoken.sendTransaction({from: user1, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const user1BalanceAfter = (await hotoken.balanceOf(user1)).toNumber()
    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()

    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)
    expect(user1BalanceAfter).to.be.equal(user1BalanceBefore)

    // need to check balance of owner
  })

  it('should not be able to retrieve ether from address that it is not in the whitelist', async function() {
    const user2 = accounts[2]
    expect((await hotoken.existsInWhitelist(user2)).toNumber()).to.be.equal(0)

    await hotoken.setPause(false)

    const amountEther = 2
    const amountWei = web3.toWei(amountEther, 'ether')
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()

    try {
      await hotoken.sendTransaction({from: user2, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()
    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)

    // need to check balance of owner
  })

  it('should not be able to retrieve ether if contract is paused', async function() {
    const user1 = accounts[1]

    await hotoken.setPause(true)
    await hotoken.addToWhitelist(user1)
    expect((await hotoken.existsInWhitelist(user1)).toNumber()).to.be.equal(1)

    const amountEther = 2
    const amountWei = web3.toWei(amountEther, 'ether')
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()

    try {
      await hotoken.sendTransaction({from: user1, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()
    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)

    // need to check balance of owner
  })

  it('should not be able to retrieve ether from owner contract address', async function() {
    const owner = accounts[0]

    await hotoken.setPause(false)
    await hotoken.addToWhitelist(owner)

    const amountEther = 2
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()

    try {
      await hotoken.sendTransaction({from: owner, value: amountWei})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()
    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)

    // need to check balance of owner
  })

  it('should be able to log event if send ether success', async function() {
    /// set USD Rate
    const usdRate = (await hotoken.getUSDRate("ETH")).toNumber()
    const owner = accounts[0]
    const user2 = accounts[2]

    await hotoken.setPause(false)
    await hotoken.setUSDRate("ETH", 400)

    // add to whitelist first
    await hotoken.addToWhitelist(user2)
    expect((await hotoken.existsInWhitelist(user2)).toNumber()).to.be.equal(1)

    const amountEther = 40
    const amountWei = web3.toWei(amountEther, 'ether')

    const ownerEtherBefore = (await web3.eth.getBalance(owner)).toNumber()
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()

    const tx = await hotoken.sendTransaction({from: user2, value: amountWei})

    // check events log
    expect(tx.logs).to.be.ok
    expect(tx.logs[0].event).to.be.equal('TokenPurchase')
    expect(tx.logs[0].args.purchaser).to.be.equal(user2)
    expect(tx.logs[0].args.beneficiary).to.be.equal(user2)
    expect(tx.logs[0].args.value.toNumber()).to.be.equal(Number(amountWei))
    expect(tx.logs[0].args.amount.toNumber()).to.be.equal(10 * (100 + 65) / 100 * 400 * amountWei)

    // need to check balance of owner
  })
})
