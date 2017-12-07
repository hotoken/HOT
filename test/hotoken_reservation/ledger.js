const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation add information to ledger', function(accounts) {
  let hotoken
  const owner = accounts[0]
  const user1 = accounts[1]
  const user2 = accounts[2]

  beforeEach(async function() {
    hotoken = await HotokenReservation.new()
  })

  it('should be able to check address exists in the ledger', async function() {
    const exists = await hotoken.existsInLedger(user2)
    expect(exists).to.be.false
  })

  it('should be able to add address information manually in the ledger', async function() {
    const amount = 4
    const tokens = 300000

    await hotoken.addToWhitelist(user2)
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()

    await hotoken.addToLedgerManual(user2, "BTC", amount, tokens)
    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()

    const exists = await hotoken.existsInLedger(user2)
    expect(tokenSoldAfter).to.be.equal(300000)
    expect(exists).to.be.true

    // TODO: need to check balance of owner
  })

  it('should increase tokenSold when add address information in the ledger', async function() {
    const amount = 5
    const tokens = 400000

    await hotoken.addToWhitelist(user2)
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()
    expect(tokenSoldBefore).to.be.equal(0)

    await hotoken.addToLedgerManual(user2, "BTC", amount, tokens)
    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()

    const exists = await hotoken.existsInLedger(user2)
    expect(tokenSoldAfter).to.be.equal(400000)
    expect(exists).to.be.true

    // TODO: need to check balance of owner
  })

  it('should not be able to add address information in the ledger if not in the whitelist', async function() {
    const amount = 100000

    try {
      await hotoken.addToLedgerManual(user2, "BTC", amount, 20000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const exists = await hotoken.existsInLedger(user2)
    expect(exists).to.be.false

    // TODO: need to check balance of owner
  })

  it('should not be able to add address information in the ledger if tokens is more then supply', async function() {
    const amount = 100000
    const tokens = web3.toBigNumber('4000000000000000000000000000000000000000').toNumber()

    await hotoken.addToWhitelist(user1)
    const tokenSoldBefore = (await hotoken.getTokenSold()).toNumber()
    expect(tokenSoldBefore).to.be.equal(0)

    try {
      await hotoken.addToLedgerManual(user1, "BTC", amount, tokens)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    const tokenSoldAfter = (await hotoken.getTokenSold()).toNumber()
    expect(tokenSoldAfter).to.be.equal(tokenSoldBefore)

    // TODO: need to check balance of owner
  })

  it('should not be able to add address information in the ledger if not call by owner', async function() {
    const amount = 100000

    await hotoken.addToWhitelist(user2)
    try {
      await hotoken.addToLedgerManual(user1, "ETH", amount, 20000, {from: user2})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    // TODO: need to check balance of owner
  })

  it('should not be able to add address information in the ledger that currency is not in usd rate map', async function() {
    const amount = 100000
    await hotoken.addToWhitelist(user2)

    try {
      await hotoken.addToLedgerManual(user1, "LTC", amount, 20000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }

    // TODO: need to check balance of owner
  })

  it('should not be able to add owner address information in the ledger', async function() {
    const amount = 100000

    try {
      await hotoken.addToLedgerManual(owner, "ETH", amount, 20000)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
    const exists = await hotoken.existsInLedger(owner)
    expect(exists).to.be.false

    // TODO: need to check balance of owner
  })

  /*
  it('should be able to get ledger information', async function() {
    await hotoken.setPause(false)
    await hotoken.addToWhitelist(user1)

    const amountEther = 1
    const amountWei = web3.toWei(amountEther, 'ether')

    await hotoken.sendTransaction({from: user1, value: amountWei})

    const tx2 = await hotoken.addToLedgerManual(user1, "BTC", 1, 20000)
    // test event AddToLedger
    expect(tx2.logs).to.be.ok
    expect(tx2.logs[0].event).to.be.equal('AddToLedger')
    expect(tx2.logs[0].args._currentTime).to.be.ok
    expect(tx2.logs[0].args._currency).to.be.equal("BTC")
    expect(tx2.logs[0].args._amount.toNumber()).to.be.equal(1)
    expect(tx2.logs[0].args._usdRate.toNumber()).to.be.equal(11000)
    expect(tx2.logs[0].args._discount.toNumber()).to.be.equal(65)
    expect(tx2.logs[0].args._tokens.toNumber()).to.be.equal(20000)

    const ledgerInformation = await hotoken.getLedgerInformation(user1)
    expect(ledgerInformation).to.be.include('datetime,currency,currency_quantity,usd_rate,discount_rate,token_quantity')
    expect(ledgerInformation).to.be.include(',ETH,1,400,65,6600000000000000000000')
    expect(ledgerInformation).to.be.include(',BTC,1,11000,65,20000')

    // TODO: need to check balance of owner
  })
  */

  it('should not be able to get ledger information if address is not exists in ledger', async function() {
    try {
      const ledgerInformation = await hotoken.getLedgerInformation(user2)
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })

  it('should not be able to get ledger information if not call by contract owner', async function() {
    try {
      const ledgerInformation = await hotoken.getLedgerInformation(user1, {from: user1})
    } catch (e) {
      expect(e.toString()).to.be.include('revert')
    }
  })
})
