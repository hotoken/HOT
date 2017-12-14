const request = require('request-promise-native')
const fs = require('fs-extra')
const R = require('ramda')
const Web3 = require('web3')

const config = require('./whitelist.config')

const email = process.env.EMAIL
const password = process.env.PASSWORD

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
      console.warn('No ETH address found on ID:', data._id);
      return false
    }

    const isEthAddressValid = Web3.utils.isAddress(ethAddress)
    if (!isEthAddressValid) {
      console.warn(`Given invalid ETH address (${ethAddress}) on ID: ${data._id}`);
      return false
    }

    console.log(`Found case ID: ${data._id} with ETH address ${ethAddress}`)
    console.log(userInfoString(userInfoPath(data)))
    return true
  })
})()
