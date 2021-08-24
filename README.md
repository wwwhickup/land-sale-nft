# land-sale-nft (IMPORTANT DO NOT FORGET: Change Mint Function name to unusual name before launch)

Public Method:

## Deploying
Deploying onto a test net like ropsten:
```bash
npx hardhat deploy-contract --walletkey <private key of deploying account> --network=ropsten
```

Deploying onto the mainnet:
```bash
npx hardhat deploy-contract --walletkey <private key of deploying account> --network=mainnet
```

## Deployments
Example of deployment of a testnet contract:
```bash
npx hardhat deploy-contract --network goerli --walletkey <private key of deploying wallet>
```

### ~~ Ropsten (Deprecated) ~~
See [.openzeppelin/ropsten.json](.openzeppelin/ropsten.json) for more details

April 14, 2022: (Upgradable)
```
Contract address: 0xE8f66a2937f6Fb3f2BFf48d1667B18fc62D7c740
Implementation address:  0x46a9646BcCD68EA04FB26CB0d11609578014ba73
Admin address:  0x1e8bc0F5Bd973098FeB8D50763e405C32db2E53C
```

### Goerli
See [.openzeppelin/goerli.json](.openzeppelin/goerli.json) for more details

June 14, 2022: (Upgradable with prices set to 0.2, 1.12, 2.52)
```
Contract address: 0xe3C2784bD931e131e49981ca77DFD5982Aa3132C
Implementation address:  0xb2939E3AeB2a1Af020F9bf398B1D1c0531173735
Admin address:  0xd78c7fdBfEF429b332183944F01Be957D6F80b2D
```

June 14, 2022: (Upgradable with prices set to 0.02, 0.112, 0.252)
```
Contract address: 0xa74f3Cbc76D1bd4f137417B7dCCfeC003da680B3
Implementation address:  0xfaD595e73405A4903CD8c01bA388B744Ad91D4F3
Admin address:  0xd78c7fdBfEF429b332183944F01Be957D6F80b2D
```