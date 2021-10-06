//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../Create3.sol";


contract Create3Imp {
  function creationCodeFor(bytes memory _code) internal pure returns (bytes memory) {
    /*
      0x00    0x63         0x63XXXXXX  PUSH4 _code.length  size
      0x01    0x80         0x80        DUP1                size size
      0x02    0x60         0x600e      PUSH1 14            14 size size
      0x03    0x60         0x6000      PUSH1 00            0 14 size size
      0x04    0x39         0x39        CODECOPY            size
      0x05    0x60         0x6000      PUSH1 00            0 size
      0x06    0xf3         0xf3        RETURN
      <CODE>
    */

    return abi.encodePacked(
      hex"63",
      uint32(_code.length),
      hex"80_60_0E_60_00_39_60_00_F3",
      _code
    );
  }

  function create(bytes32 _salt, bytes memory _runtimeCode) external payable returns (address addr) {
    return Create3.create3(_salt, creationCodeFor(_runtimeCode), msg.value);
  }

  function addressOf(bytes32 _salt) external view returns (address) {
    return Create3.addressOf(_salt);
  }
}
