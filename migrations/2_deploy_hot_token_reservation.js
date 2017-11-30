const HTKNReservation = artifacts.require('./HotokenReservation.sol')

module.exports = function(deployer, network, accounts) {
  deployer.deploy(HTKNReservation)
}

