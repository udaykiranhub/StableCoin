## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/INRT.s.sol:INRTScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```




pedda@lenova MINGW64 /x/inrt/smart-contract (master)
$ forge script script/INRTScript.sol:INRTScript   --rpc-url http://localhost:8545   --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80   --broadcast
[⠊] Compiling...
[⠒] Compiling 1 files with Solc 0.8.30
[⠆] Solc 0.8.30 finished in 1.01s
Compiler run successful!
Warning: Detected artifacts built from source files that no longer exist. Run `forge clean` to make sure builds are in sync with project files.
 - X:/INRT/smart-contract\script/INRT.sol
Script ran successfully.

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

##### anvil-hardhat
✅  [Success] Hash: 0x6ad2a55e97c455a402465f816787741aef0cec45369b4e2b5a41e0361524df55
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Sequence #1 on anvil-hardhat | Total Paid: 0.00445563000445563 ETH (4455630 gas * avg 1.000000001 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: X:/INRT/smart-contract\broadcast\INRTScript.sol\31337\run-latest.json

Sensitive values saved to: X:/INRT/smart-contract/cache\INRTScript.sol\31337\run-latest.json

