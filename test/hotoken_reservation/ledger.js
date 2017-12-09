const {expect} = require('chai')
const HotokenReservation = artifacts.require('./HotokenReservation')

contract('HotokenReservation', function(accounts) {
  describe('Ledger', function() {
    let h
    const owner = accounts[0]
    const user1 = accounts[1]
    const user2 = accounts[2]

    beforeEach(async function() {
      h = await HotokenReservation.new()

      await h.setConversionToUSDCentsRate(45000) // 1ETH = $450.00
      await h.addToWhitelist(user1)
      await h.addToWhitelist(user2)
      await h.setPause(false)
    })

    it('should be able to add address information manually in the ledger', async function() {
      const btcAmount = 2025 * 10 ** 16 // 20.25BTC
      const usdAmount = 222755 * 10 ** 18
      const usdCentRate = 1100032 // 11000.32$
      const discountRateIndex = 3
      const tokens = 3000 * 10 ** 18

      const tokenSoldBefore = (await h.tokenSold.call()).toNumber()
      const ownerBalanceBefore = (await h.balanceOf(owner)).toNumber()

      const tx = await h.addToLedgerManual(user2, 'BTC', btcAmount, usdAmount, usdCentRate, discountRateIndex, tokens)
      const tokenSoldAfter = (await h.tokenSold.call()).toNumber()
      const ownerBalanceAfter = (await h.balanceOf(owner)).toNumber()

      expect(ownerBalanceAfter).to.be.above(ownerBalanceBefore - (3000 * 10 ** 18))
      expect(tokenSoldAfter).to.be.equal(3000 * 10 ** 18)

      // If success to add in ledger, log will come up
      expect(tx.logs).to.be.ok
      expect(tx.logs[0].event).to.be.equal('AddToLedger')
      expect(tx.logs[0].args.whenRecorded).to.be.ok
      expect(tx.logs[0].args.currency).to.be.equal('BTC')
      expect(tx.logs[0].args.currencyAmount.toNumber()).to.be.equal(2025 * 10 ** 16)
      expect(tx.logs[0].args.usdCentAmount.toNumber()).to.be.equal(222755 * 10 ** 18)
      expect(tx.logs[0].args.usdCentRate.toNumber()).to.be.equal(1100032)
      expect(tx.logs[0].args.discountRateIndex.toNumber()).to.be.equal(3)
      expect(tx.logs[0].args.tokenQuantity.toNumber()).to.be.equal(3000 * 10 ** 18)
    })

    it('should be able to get ledger information', async function() {
      const btcAmount = 2025 * 10 ** 16 // 20.25BTC
      const usdAmount = 222755 * 10 ** 18
      const usdCentRate = 1100032 // 11000.32$
      const discountRateIndex = 3
      const tokens = 3000 * 10 ** 18

      const tokenSoldBefore = (await h.tokenSold.call()).toNumber()
      const ownerBalanceBefore = (await h.balanceOf(owner)).toNumber()

      await h.addToLedgerManual(user2, 'BTC', btcAmount, usdAmount, usdCentRate, discountRateIndex, tokens)

      const ledgerInfo = await h.ledgerMap.call(user2, 0)
      expect(ledgerInfo).to.be.ok
      expect(ledgerInfo[1]).to.be.equal('BTC') // currency
      expect(ledgerInfo[2].toNumber()).to.be.equal(2025 * 10 ** 16) // amount
      expect(ledgerInfo[3].toNumber()).to.be.equal(222755 * 10 ** 18) // amount
      expect(ledgerInfo[4].toNumber()).to.be.equal(1100032) // usdCentRate
      expect(ledgerInfo[5].toNumber()).to.be.equal(3) // discountRateIndex
      expect(ledgerInfo[6].toNumber()).to.be.equal(3000 * 10 ** 18) // tokenQuantity
    })

    it('should be able to add address information automatically in the ledger when buy with ETH', async function() {
      let amount = web3.toWei(2, 'ether')

      const tokenSoldBefore = (await h.tokenSold.call()).toNumber()
      const ownerBalanceBefore = (await h.balanceOf(owner)).toNumber()

      const tx = await h.sendTransaction({from: user1, value: amount})
      const tokenSoldAfter = (await h.tokenSold.call()).toNumber()
      const ownerBalanceAfter = (await h.balanceOf(owner)).toNumber()

      const ledgerInfo = await h.ledgerMap.call(user1, 0)
      expect(ledgerInfo).to.be.ok
      expect(ledgerInfo[1]).to.be.equal('ETH') // currency
      expect(ledgerInfo[2].toNumber()).to.be.equal(2 * 10 ** 18) // currencyAmount
      expect(ledgerInfo[3].toNumber()).to.be.equal(900 * 10 ** 18) // usdCentAmount
      expect(ledgerInfo[4].toNumber()).to.be.equal(45000) // usdCentRate
      expect(ledgerInfo[5].toNumber()).to.be.equal(3) // discountRateIndex
      expect(ledgerInfo[6].toNumber()).to.be.equal(14850 * 10 ** 18) // tokenQuantity

      expect(ownerBalanceAfter).to.be.above(ownerBalanceBefore - (14850 * 10 ** 18))
      expect(tokenSoldAfter).to.be.equal(14850 * 10 ** 18)

      // If success to add in ledger, log will come up
      expect(tx.logs).to.be.ok
      expect(tx.logs.length).to.be.equal(2)
      expect(tx.logs[1].event).to.be.equal('AddToLedger')
      expect(tx.logs[1].args.whenRecorded).to.be.ok
      expect(tx.logs[1].args.currency).to.be.equal('ETH')
      expect(tx.logs[1].args.currencyAmount.toNumber()).to.be.equal(2 * 10 ** 18)
      expect(tx.logs[1].args.usdCentAmount.toNumber()).to.be.equal(900 * 10 ** 18)
      expect(tx.logs[1].args.usdCentRate.toNumber()).to.be.equal(45000)
      expect(tx.logs[1].args.discountRateIndex.toNumber()).to.be.equal(3)
      expect(tx.logs[1].args.tokenQuantity.toNumber()).to.be.equal(14850 * 10 ** 18)
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('Ledger', function() {
    let hotoken
    const owner = accounts[0]
    const user1 = accounts[1]
    const user2 = accounts[2]

    beforeEach(async function() {
      h = await HotokenReservation.new()

      await h.addToWhitelist(user1)
    })

    it('should not be able to add to the ledger if not in the whitelist', async function() {
      const btcAmount = 2025 * 10 ** 16 // 20.25BTC
      const usdAmount = 222755 * 10 ** 18
      const tokens = 3000 * 10 ** 18
      const usdCentRate = 1100032 // 11000.32$
      const discountRateIndex = 3

      await h.removeFromWhiteList(user1)

      try {
        await h.addToLedgerManual(user1, 'BTC', btcAmount, usdAmount, usdCentRate, discountRateIndex, tokens)
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to add to the ledger if add tokens is more then supply', async function() {
      const btcAmount = 2025 * 10 ** 16 // 20.25BTC
      const usdAmount = 222755 * 10 ** 18
      const tokens = 4000000000 * 10 ** 18
      const usdCentRate = 1100032 // 11000.32$
      const discountRateIndex = 3

      try {
        await h.addToLedgerManual(user1, 'BTC', btcAmount, usdAmount, usdCentRate, discountRateIndex, tokens)
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to add to the ledger if not call by owner', async function() {
      const btcAmount = 2025 * 10 ** 16 // 20.25BTC
      const usdAmount = 222755 * 10 ** 18
      const tokens = 4000000000 * 10 ** 18
      const usdCentRate = 1100032 // 11000.32$
      const discountRateIndex = 3

      try {
        await h.addToLedgerManual(user1, 'BTC', btcAmount, usdAmount, usdCentRate, discountRateIndex, tokens, {from: user2})
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to add to the ledger if do not set conversion rate for that currency', async function() {
      const btcAmount = 2025 * 10 ** 16 // 20.25BTC
      const usdAmount = 222755 * 10 ** 18
      const tokens = 4000000000 * 10 ** 18
      const usdCentRate = 1100032 // 11000.32$
      const discountRateIndex = 3

      try {
        await h.addToLedgerManual(user1, 'UNKNOW_CURRENCY', btcAmount, usdAmount, usdCentRate, discountRateIndex, tokens)
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to add owner information in the ledger', async function() {
      const btcAmount = 2025 * 10 ** 2 // 20.25BTC
      const usdAmount = 222755 * 10 ** 18
      const tokens = 4000000000 * 10 ** 18
      const usdCentRate = 1100032 // 11000.32$
      const discountRateIndex = 3

      await h.addToWhitelist(owner)

      try {
        await h.addToLedgerManual(owner, 'BTC', btcAmount, usdAmount, usdCentRate, discountRateIndex, tokens)
        expect.fail(true, false, 'Operation should be reverted')
      } catch (e) {
        expect(e.toString()).to.be.include('revert')
      }
    })

    it('should not be able to get ledger information if address does not exist in ledger', async function() {
      const btcAmount = 2025 * 10 ** 16 // 20.25BTC
      const tokens = 4000000000 * 10 ** 18
      const usdCentRate = 1100032 // 11000.32$
      const discountRateIndex = 3

      try {
        await h.ledgerMap.call(user1, 0)
        expect.fail(true, false, 'Operation should be invalid')
      } catch (e) {
        expect(e.toString()).to.be.include('invalid opcode')
      }
    })
  })
})

contract('HotokenReservation', function(accounts) {
  describe('addToLedgerManual', function() {
    it('should update total sold amount', async function() {
      const user1 = accounts[1]
      const h = await HotokenReservation.deployed()
      const btcAmount = 2025 * 10 ** 16 // 20.25BTC
      const usdAmount = 22275500 // $222755.00
      const usdCentRate = 1100032 // 11000.32$
      const discountRateIndex = 3
      const tokens = 3000 * 10 ** 18
      await h.addToWhitelist(user1)
      await h.addToLedgerManual(
        user1, 'BTC', btcAmount, usdAmount, usdCentRate, discountRateIndex, tokens
      )

      let soldAmount = await h.soldAmount.call()
      expect(soldAmount.toNumber()).to.be.equal(222755 * 10 ** 18)

      // add more $1000.00
      let usd = 100000
      await h.addToLedgerManual(
        user1, 'USD', usd, usd, usdCentRate, discountRateIndex, tokens
      )
      soldAmount = await h.soldAmount.call()
      expect(soldAmount.toNumber()).to.be.equal(223755 * 10 ** 18)
    })
  })
})
