// pragma solidity ^0.6.0;
// SPDX-License-Identifier: MIT
// author: Jorik Schellekens
error OffchainLookup(
    address sender,
    string[] urls,
    bytes callData,
    bytes4 callbackFunction,
    bytes extraData
);

contract PointlessCCIP {
    string[] public urls = [
        "http://127.0.0.1:7331/?sender={sender}&data={data}"
    ];

    function lookup() public view returns (string memory) {
        revert OffchainLookup(
            address(this),
            urls,
            hex"0000000000000000000000000000000000000000000000000000000000000000",
            hex"f267f0a6",
            hex"0000000000000000000000000000000000000000000000000000000000000000"
        );
    }

    function getMessageHash(string memory _message)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_message));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }

    // selector: 0xf267f0a6
    function lookupCCIP(bytes calldata response, bytes calldata extraData)
        public
        view
        returns (string memory)
    {
        (string memory message, bytes memory sig) = abi.decode(
            response,
            (string, bytes)
        );

        bytes32 r; bytes32 s; uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        bytes32 messageHash = getMessageHash(message);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        address signer = ecrecover(ethSignedMessageHash, v, r, s);

        require(signer == address(0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199), "invalid signature");
        // require(signer == msg.sender, "invalid signature");
        // There is a bug in ethers.js CCIP-read implementation where the
        // signer is lost for the verification call :/

        return message;
    }
}
