# CCIP read for... reasons?

## What?

ERC-3668: CCIP Read: Secure offchain data retrieval

---
# CCIP read for... reasons?

## How?

```
┌──────┐                                          ┌────────┐ ┌─────────────┐
│Client│                                          │Contract│ │Gateway @ url│
└──┬───┘                                          └───┬────┘ └──────┬──────┘
   │                                                  │             │
   │ somefunc(...)                                    │             │
   ├─────────────────────────────────────────────────►│             │
   │                                                  │             │
   │ revert OffchainData(sender, urls, callData,      │             │
   │                     callbackFunction, extraData) │             │
   │◄─────────────────────────────────────────────────┤             │
   │                                                  │             │
   │ HTTP request (sender, callData)                  │             │
   ├──────────────────────────────────────────────────┼────────────►│
   │                                                  │             │
   │ Response (result)                                │             │
   │◄─────────────────────────────────────────────────┼─────────────┤
   │                                                  │             │
   │ callbackFunction(result, extraData)              │             │
   ├─────────────────────────────────────────────────►│             │
   │                                                  │             │
   │ answer                                           │             │
   │◄─────────────────────────────────────────────────┤             │
   │                                                  │             │
```
Credit https://eips.ethereum.org/EIPS/eip-3668

---

# CCIP read for... reasons?

## Why CCIP?

- off-chain storage may be cheaper
- off-chain computation may be cheaper
- CCIP can still be 'secure'
  - secure as in authenticated
- the gateway can be anything
  - zeronet
  - local IPFS
  - some other network... StarkNet?
  - 152.216.7.110
- easy to model bridges (state-proofs for example)

---

# CCIP read for... reasons?

## Why CCIP

- it's cool 😎

---

# CCIP read for the lols.

## Let's get stuck in

```
git clone git@github.com:JorikSchellekens/ccip-read-demo.git
```

---

# Notes

You'll need to use hardhat node because ethersjs and ganache don't get along :(

---

# The CCIP-read revert

```solidity




  error  OffchainLookup(
    address sender,
    string[] urls,
    bytes callData,
    bytes4 callbackFunction,
    bytes extraData
  );
```

---

# A simple lookup function

```solidity

string[] public urls = ["http://127.0.0.1:7331/?sender={sender}&data={data}"];

function lookup() public view returns (bytes memory) {
  revert OffchainLookup(
    address(this),
    urls,
    hex"0000000000000000000000000000000000000000000000000000000000000000",
    hex"f267f0a6", // Selector for the callback
    hex"0000000000000000000000000000000000000000000000000000000000000000"
  );
}
```

---

# Callback function

```solidity



// selector: 0xf267f0a6
function lookupCCIP(bytes calldata response, bytes calldata extraData) public pure returns (bytes calldata) {
  return response;
}
```

---

# The gateway

```python
import http from 'http';
import url from 'url';

const port = 7331;
const host = '127.0.0.1';

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const sender = parsedUrl.query["sender"];
  const data = parsedUrl.query["data"];

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(JSON.stringify(

    {
      "data": "0xdeadbeefdecafbad"
    }

  ));
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
```
---

# Doing CCIP with ethers.js

```typescript
  const result = await contract.lookup({ccipReadEnabled: true});
```

simples!

---

# 5 minute poke-around break

Give it a whirl - go read the files

You'll need to spin up a hardhat node:

```bash
cd hardhat-node
yarn
yarn hardhat node
```

Start the gateway:

```bash
cd 0_pointless_ccip
yarn
yarn ts-node gateway.ts
```

Then do the CCIP-read query:

```bash
cd 0_pointless_ccip
yarn
yarn ts-node gateway.ts
```

---
# A 'signed' lookup function

```solidity

string[] public urls = ["http://127.0.0.1:7331/?sender={sender}&data={data}"];

function lookup() public view returns (bytes memory) {
  revert OffchainLookup(
    address(this),
    urls,
    hex"0000000000000000000000000000000000000000000000000000000000000000",
    hex"f267f0a6", // Selector for the callback
    hex"0000000000000000000000000000000000000000000000000000000000000000"
  );
}
```

The sun didn't find anything new here.

---
# Verify the signature in the callback

```solidity
// selector: 0xf267f0a6
function lookupCCIP(bytes calldata response, bytes calldata extraData) public view returns (string memory) {

    // Decode the data fetched from the gateway

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

    // Verify the signature

    bytes32 messageHash = getMessageHash(message);
    bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

    address signer = ecrecover(ethSignedMessageHash, v, r, s);

    require(signer == address(0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199), "invalid signature");
    // require(signer == msg.sender, "invalid signature");
    // There is a bug in the ethers.js CCIP-read implementation where the
    // signer is changed to the default signer for the verification call :/

    return message;
}
```

---

# The gateway signs the message

```
async function encodeData(): Promise<string> {
  const contractAddress = readFileSync("./artifacts/contract").toString();
  const abi = JSON.parse(readFileSync("./artifacts/PointlessCCIP.abi").toString())
  const contract = new ethers.Contract(contractAddress, abi, account);


  const hash = await contract.getMessageHash(message)
  const sig = await wallet.signMessage(ethers.utils.arrayify(hash))
  console.log(  ethers.utils.defaultAbiCoder.encode(["string", "bytes"], [message, sig]))
  return ethers.utils.defaultAbiCoder.encode(["string", "bytes"], [message, sig]);
}
```

---

# The client doesn't do anything different

```typescript
  const result = await contract.lookup({ccipReadEnabled: true});
```

simples!

---

# Some more time for me to dawdle and recover (and answer some questions)

---

# Quick intro to State Proofs


```
                                state root
                              +------------+
                              |            |
                              | 0x2fe34452 |
                              |            |
                              +------------+
                      +-------------+---------------+
             +------------+                  +------------+
             |            |                  |            |
             | 0x489e2009 |                  | 0xff453082 |
             |            |                  |            |
             +------------+                  +------------+
            +-------+-------+               +-------+-------+
     +------------+  +------------+  +------------+  +------------+
     |            |  |            |  |            |  |            |
     | 0xa45c69d2 |  | 0x582de091 |  | 0xdeadbeef |  | 0xcaffeeee |
     |            |  |            |  |            |  |            |
     +------------+  +------------+  +------------+  +------------+
            |               |               |               |
     +------------+  +------------+  +------------+  +------------+
     |            |  |            |  |            |  |            |
     |     12     |  |   "Jonk"   |  |    00000   |  |    0000    |
     |            |  |            |  |            |  |            |
     +------------+  +------------+  +------------+  +------------+
```

---

# Quick intro to State Proofs

```
                                state root
                              +------------+
                              |            |
                              | 0x2fe34452 |
                              |            |
                              +------------+
                      +-------------+---------------+
             +------------+                  +------------+
             |            |                  |            |
             | 0x489e2009 |                  | 0xff453082 |
             |            |                  |            |
             +------------+                  +------------+
            +-------+-------+
     +------------+  +------------+
     |            |  |            |
     | 0xa45c69d2 |  | 0x582de091 |
     |            |  |            |
     +------------+  +------------+
                            |
                     +------------+
                     |            |
                     |   "Jonk"   |
                     |            |
                     +------------+
```

---

# Quick tool

```css
https://ccip-helper.nethermind.io/
```

---

```css
https://ccip-helper.nethermind.io/
```

```json
{
  "contract_proof": [
    {
      "binary": {
        "left": "0x7b61f8e0f02d3059be3d437f8101be889ba3e591f4fe68b7ba1215a2f9bd245",
        "right": "0x1b56089ca0658a1c8a97a45437b3d4506747bd566d167beb911b7b309b6e864"
      }
    },
  ],
  "contract_data": {
    "class_hash": "0xd0e183745e9dae3e4e78a8ffedcce0903fc4900beace4e0abf192d4c202da3",
    "nonce": "0x0",
    "root": "0x710aa553551d3491512174ec43deec6aacda9c5134a4b64d329ff40d4e2d696",
    "contract_state_hash_version": "0x0",
    "storage_proofs": [
      [
        {
          "binary": {
            "left": "0x2201d742911fd192e30c4d843abae589fb4d8315762d338ee04b810ef7e8f54",
            "right": "0x676443f10eb929e6e7b6b73135c3987894b9122b329c3b7ef9adb354a35c6ce"
          }
        }
      ]
    ]
  }
}
