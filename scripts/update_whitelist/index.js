const request = require('request-promise-native')
const fs = require('fs-extra')
const util = require('util')
const R = require('ramda')
const Web3 = require('web3')

const config = require('./whitelist.config')

const email = process.env.KYC_EMAIL
const password = process.env.KYC_PASSWORD

const excludedIdIndex = config.excludes.reduce((index, e) => {
  return {...index, [e]: true}
}, {})

async function login(email, password) {
  return request({
    url: 'https://kyc-api.hotoken.io/authenticate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: {
      email, password
    },
    json: true,
  })
}

async function listClosedCases(orgId, token) {
  return request({
    url: `https://kyc-api.hotoken.io/organization/${orgId}/kyc/closed`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    json: true,
  })
}

async function getCaseData(orgId, caseId, token) {
  return request({
    url: `https://kyc-api.hotoken.io/organization/${orgId}/kyc/${caseId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    json: true,
  })
}

async function whitelistContains(owner, contract, address) {
  const whitelist = util.promisify(contract.methods.whitelist(address).call)
  const result = await whitelist({from: owner})
  return result === '1'
}

function userInfoString(user) {
  return `${user.firstName} ${user.lastName} (${user.email})`
}

const ethAddressPath = R.path(['escrow', 'answers', 0, 'answer', 0]);
const userInfoPath = R.path(['user']);

(async function() {

  const {token} = await login(email, password)
  const {items: closedCases} = await listClosedCases(config.organizationId, token)

  const approvedCases = closedCases
  .filter(c => c.currentStatus === 2 && !excludedIdIndex[c._id])

  const casesData = await Promise.all(
    approvedCases.map(c => getCaseData(config.organizationId, c._id, token))
  )

  const validCases = casesData.filter(data => {
    const ethAddress = ethAddressPath(data)
    const hasEthAddress = !!ethAddress
    if (!hasEthAddress) {
      console.warn('No ETH address found on ID:', data._id, userInfoString(userInfoPath(data)));
      return false
    }

    const isEthAddressValid = Web3.utils.isAddress(ethAddress)
    if (!isEthAddressValid) {
      console.warn(`Given invalid ETH address (${ethAddress}) on ID: ${data._id}`);
      return false
    }

    return true
  })

  // check with live contract
  console.log('Creating Web3 instance...')
  const web3 = new Web3(new Web3.providers.HttpProvider(
    `http://localhost:8545`
  ))

  console.log('Creating Web3 reservation contract...')
  const compiledReservation = require('../../build/contracts/HotokenReservation')

  const owner = process.env.OWNER
  const ownerPassword = process.env.OWNER_PASSWORD
  web3.eth.personal.unlockAccount(owner, ownerPassword)
  .then(async function() {
    console.log('Owner account unlocked')
    console.log('Creating contract instance...')
    const Reservation = new web3.eth.Contract(compiledReservation.abi, '0x882a78892Ddd427cF55FFD20C3496047fC63B24D')

    console.log('Checking KYC cases...')
    const cases = await Promise.all(validCases.map(async function(c) {
      const address = ethAddressPath(c)
      const isInWhitelist = await whitelistContains(owner, Reservation, address)
      return {
        id: c._id,
        address,
        isInWhitelist,
        data: c,
      }
    }))
    
    console.log('Filtering not-in-whitelist cases...')
    const notInWhitelistCases = cases.filter(c => !c.isInWhitelist)
    console.log(`Adding ${notInWhitelistCases.length} to whitelist...`)
    notInWhitelistCases.forEach(c => {
      const buyer = userInfoString(userInfoPath(c.data))

      console.log(`Adding ${c.address}`)
      Reservation.methods.addToWhitelist(c.address)
        .send({from: owner})
        .on('transactionHash', (hash) => {
          console.log(`Tx hash [${hash}] buyer: ${buyer}, address: ${c.address}, id: ${c.id}`)
        })
        .on('receipt', (r) => {
          console.log(`Get receipt from ${r.transactionHash}`)
          console.log(r)
        })
    })
  })

})()
