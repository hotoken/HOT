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
```