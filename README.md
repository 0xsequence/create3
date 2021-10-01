# CREATE3

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

### Create3 instances

