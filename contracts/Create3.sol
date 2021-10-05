//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


library Create3 {
  error ErrorCreatingProxy();
  error ErrorCreatingContract();
  error TargetAlreadyExists();

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

  function childBytecode() internal pure returns (bytes memory) {
    /*
      0x00    0x36         0x36      CALLDATASIZE      cds
      0x01    0x3d         0x3d      RETURNDATASIZE    0 cds
      0x02    0x80         0x80      DUP1              0 0 cds
      0x03    0x37         0x37      CALLDATACOPY
      0x04    0x36         0x36      CALLDATASIZE      cds
      0x05    0x3d         0x3d      RETURNDATASIZE    0 cds
      0x06    0x34         0x34      CALLVALUE         val 0 cds
      0x07    0xf0         0xf0      CREATE            addr
      0x08    0xff         0xff      SELFDESTRUCT
    */
    return creationCodeFor(hex"36_3d_80_37_36_3d_34_f0_ff");
  }

  function codeSize(address _addr) internal view returns (uint256 size) {
    assembly { size := extcodesize(_addr) }
  }

  function create3(bytes32 _salt, bytes memory _creationCode) internal returns (address addr) {
    return create3(_salt, _creationCode, 0);
  }

  function create3(bytes32 _salt, bytes memory _creationCode, uint256 _value) internal returns (address addr) {
    // Creation code
    bytes memory creationCode = childBytecode();

    // Get target final address
    addr = addressOf(_salt);
    if (codeSize(addr) != 0) revert TargetAlreadyExists();

    // Create CREATE2 proxy
    address proxy; assembly { proxy := create2(_value, add(creationCode, 32), mload(creationCode), _salt)}
    if (proxy == address(0)) revert ErrorCreatingProxy();

    // Call proxy with final init code
    (bool success,) = proxy.call(_creationCode);
    if (!success || codeSize(addr) == 0) revert ErrorCreatingContract();
  }

  function addressOf(bytes32 _salt) internal view returns (address) {
    address proxy = address(
      uint160(
        uint256(
          keccak256(
            abi.encodePacked(
              hex'ff',
              address(this),
              _salt,
              keccak256(childBytecode())
            )
          )
        )
      )
    );

    return address(
      uint160(
        uint256(
          keccak256(
            abi.encodePacked(
              hex"d6",
              hex"94",
              proxy,
              hex"01"
            )
          )
        )
      )
    );
  }
}
