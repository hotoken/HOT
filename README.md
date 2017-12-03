# Hotoken

[https://hotoken.io/](https://hotoken.io/)

## Prerequisite

- Nodejs v9.2.0

## Setup

```
$ npm install
```

## Development
```
$ npm run compile
$ npm run testrpc
$ npm run migrate
$ npm test
```

## Private Network Testing
This guide is about testing the contracts on the real network, not the `testrpc` network,
but also not the main one. Keep in mind that our **unit tests** using `testrpc` network
to run so it will not be included here. In case you have run unit tests before go
to this section, please make sure that you already stop `testrpc` network before
continue.

### Set up private network
Note: This guide will use `geth` to create a node. Make sure you have `geth` installed in your machine.

#### Initialize genesis block
Note: You need to do this only once per network.

You need data directory and genesis file to initialize a network. You can find `genesis.json` in `scripts` directory.
```
# Create a network directory
$ mkdir /path/to/network/directory
$ cd /path/to/network/directory
# Create chaindata directory, it will be use as geth data directory
$ mkdir chaindata
# Initialize
$ geth --datadir=./chaindata init ./genesis.json
```
You should see the output like this:
```
WARN [12-03|21:05:50] No etherbase set and no accounts found as default 
INFO [12-03|21:05:50] Allocated cache and file handles         database=/path/to/network/directory/chaindata/geth/chaindata cache=16 handles=16
INFO [12-03|21:05:50] Writing custom genesis block 
INFO [12-03|21:05:50] Successfully wrote genesis state         database=chaindata                                                           hash=9b8d4a…9021ba
INFO [12-03|21:05:50] Allocated cache and file handles         database=/path/to/network/directory/chaindata/geth/lightchaindata cache=16 handles=16
INFO [12-03|21:05:50] Writing custom genesis block 
INFO [12-03|21:05:50] Successfully wrote genesis state         database=lightchaindata
```

#### Start blockchain node using Geth
We need to run `geth` with `--rpc --rpcapi="db,eth,net,web3,personal,web3"` to be able
to connect with it later using `web3` client.
```
# Inside /path/to/network/directory
$ geth --datadir=./chaindata --rpc --rpcapi="db,eth,net,web3,personal,web3"
```
You should see these line at the end of the output:
```
INFO [12-03|21:13:29] Mapped network port                      proto=udp extport=30303 intport=30303 interface="UPNP IGDv2-IP1"
INFO [12-03|21:13:29] HTTP endpoint opened: http://127.0.0.1:8545 
INFO [12-03|21:13:29] IPC endpoint opened: /path/to/network/directory/chaindata/geth.ipc 
INFO [12-03|21:13:29] Mapped network port                      proto=tcp extport=30303 intport=30303 interface="UPNP IGDv2-IP1"
```
The most important line is the location of `ipc` file: `IPC endpoint opened: /path/to/network/directory/chaindata/geth.ipc`.
We need this file to attach to the opened node later.

### Connect Mist to the network
We will use [Mist](https://github.com/ethereum/mist) as a blockchain client.
Make sure you have it installed in your machine.
```
# Start Mist
$ mist --rpc /path/to/network/directory/chaindata/geth.ipc
```
This will connect Mist to opened node. You should see your created account, in
case you created it before. If you don't have one you can create it using Mist UI.

### Start mining
To have some ether in the wallet and do transactions we need to start the miner
on our node.
```
# Open geth interactive shell
$ geth attach rpc:/path/to/network/directory/chaindata/geth.ipc
```
You should get geth interactive shell open and waiting for your command.
```
# In geth interactive shell
> miner.start(4);
```
`4` is number of threads you want to use. I found that set this number too low can cause
the error because the transaction will take too long to complete. `4` never 
produce the error in my machine.

You should gain some ethers in your wallet now. You can stop miner by:
```
# In geth interactive shell
> miner.stop();
```
Remember that your transaction cannot complete without miner running. Don't 
forget to start it before send any transaction.

### Deploy ReservedHotToken
Make sure you have the latest version of this repository and have [NodeJS](https://nodejs.org/en/)
version `>=9.2.0`. The deployment script is written using some new ES6 syntax
which may not be supported in older version. I recommend that you should use
[NVM](https://github.com/creationix/nvm) to manage NodeJS version in your machine.
```
# Install dependencies
$ npm install
# Compile contracts
$ npm run compile
```
You should see output json files in your `build` directory.
```
$ tree build
build
└── contracts
    ├── BasicToken.json
    ├── ERC20Basic.json
    ├── ERC20.json
    ├── HotokenReservation.json
    ├── Migrations.json
    ├── Ownable.json
    ├── SafeMath.json
    ├── StandardToken.json
    └── StupidReservation.json
```
#### Config deployment networks
Check your `scripts/deploy.config.js` to make sure that it matches your network configuration.
You can put more than one network configuration in this file.
```
# Remember your network name, in this example is **test**

module.exports = {
  networks: {
    test: {
      host: 'localhost',
      port: 8545,
      gas: 2880000,
    }
  }
}
```

To deploy, you need to set:
- **OWNER** address of contract owner
- **PASSWORD** owner account password
- **NETWORK** network name in deploy.config.js

Then run `npm run deploy` to deploy the contract:
```
$ OWNER=0xF1d2f5D323EF5807e8b27291fC54a8bad8A31C1A NETWORK=test PASSWORD=12345678 npm run deploy
```
It will take minute or more to complete the transaction, up to how many thread you have spent on mining.