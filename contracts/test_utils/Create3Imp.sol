//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../Create3.sol";


contract Create3Imp {
  function create(bytes32 _salt, bytes memory _runtimeCode) external payable returns (address addr) {
    return Create3.create3(_salt, Create3.creationCodeFor(_runtimeCode), msg.value);
  }

  function addressOf(bytes32 _salt) external view returns (address) {
    return Create3.addressOf(_salt);
  }
}
