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
- easy to model bridges (state-proofs for example)
- CCIP can still be 'secure'
  - secure as in authenticated
- the gateway can be anything
  - zeronet
  - local IPFS
  - some other network... StarkNet?
  - 152.216.7.110

---

# CCIP read for... reasons?

## Why CCIP 

- it's cool 😎

---

# CCIP read for the lols.



