const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const solc = require('solc')
const config = require('./deploy.config')

const owner = process.env.OWNER
const password = process.env.PASSWORD
const networkConfig = config.networks[process.env.NETWORK]

console.log('Loading contract source code...')
// const source = fs.readFileSync(path.resolve(__dirname, '../contracts/HotokenReservation.sol'))
// console.log('Compiling contract...')
// const compiled = solc.compile(source.toString(), 1) // 1 is for activating optimizer
// console.error(compiled)
// const compiledReservation = compiled.contracts[':HotokenReservation']
const compiledReservation = require('../build/contracts/HotokenReservation')

console.log('Creating Web3 instance...')
const web3 = new Web3(new Web3.providers.HttpProvider(
  `http://${networkConfig.host}:${networkConfig.port}`
))


console.log('Creating Web3 reservation contract...')
const reservationContract = new web3.eth.Contract(compiledReservation.abi)

console.log(`Start deploying contract with owner: ${owner}`)
web3.eth.personal.unlockAccount(owner, password)
.then(() => {
  return reservationContract.deploy({
    data: compiledReservation.bytecode,
  })
  .send({
    from: owner,
    gas: networkConfig.gas,
  })
})
.then((deployed) => {
  console.log(`Successfully deployed contract`, deployed.options.address)
}, (e) => {
  console.error('Error deploying contract', e)
})

