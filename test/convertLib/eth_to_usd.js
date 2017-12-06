const {expect} = require('chai')
const ConvertLib = artifacts.require('./ConvertLib.sol')

contract('ConvertLib, convert ETH To USD [ Rate 1 ETH = 405.25$ ]', function() {
  let convertLib

  before(async function () {
    convertLib = await ConvertLib.new();
  });

  it('1 ETH => USD = 405.25', async function() {
    const amountEther = 1
    const usdRate = 405.25 * Math.pow(10, 18)
    const amountWei = web3.toWei(amountEther, 'ether')
    const result = await convertLib.convertETHToUSD(amountWei, usdRate)
    expect(result.toNumber()).to.be.equal(405250000000000000000)
  })

  it('1.5 ETH => USD = 607.875', async function() {
    const amountEther = 1.5
    const usdRate = 405.25 * Math.pow(10, 18)
    const amountWei = web3.toWei(amountEther, 'ether')
    const result = await convertLib.convertETHToUSD(amountWei, usdRate)
    expect(result.toNumber()).to.be.equal(607875000000000000000)
  })

  it('2.46 ETH => USD = 996.915', async function() {
    const amountEther = 2.46
    const usdRate = 405.25 * Math.pow(10, 18)
    const amountWei = web3.toWei(amountEther, 'ether')
    const result = await convertLib.convertETHToUSD(amountWei, usdRate)
    expect(result.toNumber()).to.be.equal(996915000000000000000)
  })

  it('1.23456 ETH => USD = 500.30544', async function() {
    const amountEther = 1.23456
    const usdRate = 405.25 * Math.pow(10, 18)
    const amountWei = web3.toWei(amountEther, 'ether')
    const result = await convertLib.convertETHToUSD(amountWei, usdRate)
    expect(result.toNumber()).to.be.equal(500305440000000000000)
  })

  it('1.000001 ETH => USD = 405.25040525', async function() {
    const amountEther = 1.000001
    const usdRate = 405.25 * Math.pow(10, 18)
    const amountWei = web3.toWei(amountEther, 'ether')
    const result = await convertLib.convertETHToUSD(amountWei, usdRate)
    expect(result.toNumber()).to.be.equal(405250405250000000000)
  })
})