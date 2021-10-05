# CREATE3

[![tests](https://github.com/0xsequence/create3/actions/workflows/tests.yml/badge.svg)](https://github.com/0xsequence/create3/actions/workflows/tests.yml)
[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)


This contract library enables EVM contract creation in a similar way to CREATE2, but without including the contract `initCode` on the address derivation formula. It can be used to generate deterministic contract addresses that aren't tied to a specific contract code.

[EIP-3171](https://github.com/ethereum/EIPs/pull/3171) aims to implement this funcionality natively, in the meantime this library should emulate the same behavior with a small cost overhead.

### Features

- Deterministic contract address based on `msg.sender` + salt
- Same contract addresses on different EVM networks
- Lightway and without clutter
- Supports any EVM compatible chain with support for CREATE2
- Payable contract creation (forwarded to child contract)
- Constructors supported
- Standard contract init code (aka, Etherscan verification supported)

### Limitations

- More expensive than CREATE or CREATE2 (Fixed extra cost of ~60k gas)

## Usage

Call the `create3` method on the `Create3` library, provide the contract `creationCode` and a salt. Different contract codes will result on the same address as long as the same salt is provided.

### Install

`yarn add https://github.com/0xsequence/create3`

or

`npm install --save https://github.com/0xsequence/create3`

### Contract example

```sol
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@0xsequence/create3/contracts/Create3.sol";


contract Child {
  function hola() external view returns (string) {
    return "mundo";
  }
}

contract Deployer {
  function deployChild() external {
    Create3.create3(keccak256(bytes("<my salt>")), type(Child).creationCode);
  }
}
```

# License - Unlicense

```
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
```
