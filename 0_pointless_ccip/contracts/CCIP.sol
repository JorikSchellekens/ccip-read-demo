// pragma solidity ^0.6.0;
// SPDX-License-Identifier: MIT
// author: Jorik Schellekens
error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData);

contract CCIP {
  string[] public urls = ["http://127.0.0.1:7331/?sender={sender}&data={data}"];
  function lookup() public view returns (bytes memory) {
    revert OffchainLookup(
      address(this),
      urls,
      hex"0000000000000000000000000000000000000000000000000000000000000000",
      hex"f267f0a6",
      hex"0000000000000000000000000000000000000000000000000000000000000000"
    );
  }


  // selector: 0xf267f0a6
  function lookupCCIP(bytes calldata response, bytes calldata extraData) public pure returns (bytes calldata) {
    return response;
  }
}

