//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


contract OgCreates {
  error ErrorDeployingContract();
  
  function creationCodeFor(bytes memory _code) internal pure returns (bytes memory) {
    /*
      63 PUSH4 <CODE_SIZE>
      80 DUP1
      60 PUSH1 <PREFIX_SIZE> (0x0e - 14)
      60 PUSH1 00
      39 CODECOPY
      60 PUSH1 00
      F3 RETURN
      <CODE>
    */

    return abi.encodePacked(
      hex"63",
      uint32(_code.length),
      hex"80_60_0E_60_00_39_60_00_F3",
      _code
    );
  }
  
  function create1(bytes calldata _code) external {
    bytes memory code = creationCodeFor(_code);
    address res; assembly { res := create(0, add(code, 32), mload(code)) }
    if (res == address(0)) revert ErrorDeployingContract();
  }

  function create2(bytes calldata _code, bytes32 _salt) external {
    bytes memory code = creationCodeFor(_code);
    address res; assembly { res := create2(0, add(code, 32), mload(code), _salt) }
    if (res == address(0)) revert ErrorDeployingContract();
  }
}
