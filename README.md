# CREATE3

[![tests](https://github.com/0xsequence/create3/actions/workflows/tests.yml/badge.svg)](https://github.com/0xsequence/create3/actions/workflows/tests.yml)

This contract library enables EVM contract creation in a similar way to CREATE2, but without including the contract `initCode` on the address derivation formula. It can be used to generate deterministic contract addresses that aren't tied to a specific contract implementation.

### Features

- Deterministic contract address based on msg.sender + salt
- Same contract addresses on different EVM networks
- Lightway and without clutter
- Supports any EVM compatible chain with support for CREATE2
- Payable contract creation (forwarded to child contract)

### Limitations

- Constructors are not supported
- More expensive than CREATE or CREATE2 (2x or 3x, it depends)
- Etherscan child contract verification may not be supported

## Usage

Call `create` with `salt` and `runtimeCode`, address will be determined based on the caller address and the provided salt.

Example:

```sol
contract Child {
  function hola() external view returns (string) {
    return "mundo";
  }
}

contract Deployer {
  Create3 constant create3 = Create3(0x...);

  function deployChild() external {
    create3.create(keccak256("<my salt>"), type(Child).runtimeCode);
  }
}
```

### CREATE3 instances

Pre-deployed instances of the CREATE3 library exist on the following addresses:

| Network          | Address                                    |
|------------------|--------------------------------------------|
| Mainnet          | 0x2EEf3981d24db4E38751bF1A3D27783066A40A9C |
| Arbitrum         | 0x2EEf3981d24db4E38751bF1A3D27783066A40A9C |
| Polygon          | 0x2EEf3981d24db4E38751bF1A3D27783066A40A9C |
| Mumbai (Polygon) | 0x2EEf3981d24db4E38751bF1A3D27783066A40A9C |
| Arbitrum testnet | 0x2EEf3981d24db4E38751bF1A3D27783066A40A9C |
| Rinkeby          | 0x2EEf3981d24db4E38751bF1A3D27783066A40A9C |
| Görli            | 0x2EEf3981d24db4E38751bF1A3D27783066A40A9C |
| Kovan            | 0x2EEf3981d24db4E38751bF1A3D27783066A40A9C |
| Ropsten          | 0x2EEf3981d24db4E38751bF1A3D27783066A40A9C |

All deployments have been made using an [UniversalDeployer](https://gist.github.com/Agusx1211/de05dabf918d448d315aa018e2572031) instance, the library should be able to be deployed on aditional EVM compatible chains using the same method.

> Notice: it's not required for CREATE3 to have the same address on different chains, UniversalDeployer is only used for convenience.
