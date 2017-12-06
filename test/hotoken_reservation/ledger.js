const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

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

    // need to check balance of owner
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

    // need to check balance of owner
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

    // need to check balance of owner
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

    // need to check balance of owner
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

    // need to check balance of owner
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

    // need to check balance of owner
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

    // need to check balance of owner
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

    // need to check balance of owner
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