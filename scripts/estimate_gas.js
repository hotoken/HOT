const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const solc = require('solc')
const config = require('./deploy.config')

const owner = process.env.OWNER
const networkConfig = config.networks[process.env.NETWORK]

console.log('Loading contract source code...')
const compiledReservation = require('../build/contracts/HotokenReservation')

console.log('Creating Web3 instance...')
const web3 = new Web3(new Web3.providers.HttpProvider(
  `http://${networkConfig.host}:${networkConfig.port}`
))

web3.eth.estimateGas({
  from: process.env.OWNER,
  data: compiledReservation.bytecode,
})
.then((gas) => {
  const price = process.env.GASPRICE
  console.log(`Estimated gas usage: ${gas}`)
  console.log(`Gas price: ${price}`)

  const costInGwei = price*gas
  console.log(`Gas cost (gwei): ${costInGwei}`)

  const costInEth = costInGwei*10**9/(10**18)
  console.log(`Gas cost (ETH): ${costInEth}`)
})
