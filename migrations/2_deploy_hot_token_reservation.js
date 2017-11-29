const HTKNReservation = artifacts.require('./HotokenReservation.sol')

module.exports = function(deployer) {
  deployer.deploy(HTKNReservation)
}

