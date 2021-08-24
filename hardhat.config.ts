import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-ethers'
import '@openzeppelin/hardhat-upgrades'
import { task, types } from 'hardhat/config'
import { BigNumber } from 'ethers'

task('deploy-contract', 'Deploys the contract')
  .addOptionalParam(
    'walletkey',
    'Private key of the wallet with which to deploy the token'
  )
  .setAction(async (args, hre) => {
    const { ethers, upgrades } = hre

    const signer = args.walletkey
      ? new ethers.Wallet(args.walletkey, ethers.provider)
      : (await ethers.getSigners())[0]

    if (!signer) {
      throw new Error(
        'Please specify a walletkey for deploying the transaction'
      )
    }
    // We get the contract to deploy
    const contractFactory = await ethers.getContractFactory(
      'MultiverseMetaLand',
      signer
    )
    const contract = await upgrades.deployProxy(contractFactory, [], {
      initializer: 'mmlInit',
    })
    await contract.deployed()
    console.log('Contract deployed')
    const receipt = await contract.deployTransaction.wait()
    console.log(`Gas used: ${receipt.gasUsed.toString()}`, receipt)
    console.log('Contract address:', contract.address)
    console.log(
      'Implementation address: ',
      await upgrades.erc1967.getImplementationAddress(contract.address)
    )
    console.log(
      'Admin address: ',
      await upgrades.erc1967.getAdminAddress(contract.address)
    )
  })

task('mint', 'Mint an NFT')
  .addParam(
    'contract',
    'The "0x..." address of the contract (defaults to the dev contract).',
    '0xe3C2784bD931e131e49981ca77DFD5982Aa3132C' // goerli contract address
  )
  .addParam('quantity', 'The number of lots to mint', undefined, types.string)
  .addParam(
    'landsize',
    'The dimension of the lot to mint (1, 2, or 3) where 1=1x1, 2=2x2, 3=3x3',
    undefined,
    types.int
  )
  .addOptionalParam('walletkey', 'Private key of the sending wallet')
  .setAction(async (args, hre) => {
    const ethers = hre.ethers

    const Contract = await ethers.getContractFactory('MultiverseMetaLand') //, signer)

    const signer = args.walletkey
      ? new ethers.Wallet(args.walletkey, ethers.provider)
      : (await ethers.getSigners())[0]

    if (!signer) {
      throw new Error('Please specify a walletkey to mint with')
    }

    const price = await Contract.attach(args.contract)
      .connect(signer)
      .mintRates(args.landsize)
    const value = BigInt(args.quantity) * BigInt(price)

    const response = await Contract.attach(args.contract)
      .connect(signer)
      .mint(args.quantity, args.landsize, { value })
    console.log('Transaction response:', response)
    const receipt = await response.wait()
    console.log(`Gas used: ${receipt.gasUsed.toString()}`, receipt)
  })

task('balance_of', 'Retrieve the balance of an account')
  .addParam(
    'token',
    'The "0x..." address of the token (defaults to the dev token).',
    '0xe3C2784bD931e131e49981ca77DFD5982Aa3132C' // goerli contract address
  )
  .addParam('account', 'The account address', undefined, types.string)
  .addOptionalParam('walletkey', 'Private key of the sending wallet')
  .setAction(async (args, hre) => {
    const ethers = hre.ethers

    const Contract = await ethers.getContractFactory('MultiverseMetaLand') //, signer)

    const signer = args.walletkey
      ? new ethers.Wallet(args.walletkey, ethers.provider)
      : ethers.Wallet.createRandom().connect(ethers.provider)

    const txn = await Contract.attach(args.token)
      .connect(signer)
      .balanceOf(args.account)
    console.info(txn)
  })

task('get-prices', 'Retrieve the current prices (mintRate)')
  .addParam(
    'token',
    'The "0x..." address of the token (defaults to the dev token).',
    '0xe3C2784bD931e131e49981ca77DFD5982Aa3132C' // goerli contract address
  )
  .addOptionalParam('walletkey', 'Private key of the sending wallet')
  .setAction(async (args, hre) => {
    const ethers = hre.ethers

    const Contract = await ethers.getContractFactory('MultiverseMetaLand') //, signer)

    const signer = args.walletkey
      ? new ethers.Wallet(args.walletkey, ethers.provider)
      : ethers.Wallet.createRandom().connect(ethers.provider)

    const sale = Contract.attach(args.token).connect(signer)

    const rates = []
    rates.push(await sale.mintRates(1))
    rates.push(await sale.mintRates(2))
    rates.push(await sale.mintRates(3))
    console.info(
      rates.map((x: BigNumber) => {
        if (x._isBigNumber) {
          // preserve 3 decimal points of precision when reporting prices
          const approx =
            x.div(BigNumber.from('1000000000000000')).toNumber() / 1000
          return approx
        }
        throw new Error(
          `Unexpected return value from mintRates call (not a BigInt): ${x}`
        )
      })
    )
  })

task(
  'print-abi-lib',
  'Prints Typescript file exporting the JSON interface of the MultiverseMetaLand contract'
).setAction(async (_args, hre) => {
  function ensureNameFieldInAbiJson(contractJson: string): string {
    const interimAbi = JSON.parse(contractJson) as Record<string, any>[]
    const fullyNamedAbi = interimAbi.map((fragment) => {
      const namedFragment = {
        ...fragment,
        inputs:
          fragment.inputs &&
          fragment.inputs.map((inFragment: Record<string, any>) => {
            return { ...inFragment, name: inFragment.name || '' }
          }),
        outputs:
          fragment.outputs &&
          fragment.outputs.map((inFragment: Record<string, any>) => {
            return { ...inFragment, name: inFragment.name || '' }
          }),
      }
      if (!namedFragment.inputs) {
        delete namedFragment.inputs
      }
      if (!namedFragment.outputs) {
        delete namedFragment.outputs
      }
      return namedFragment
    })
    return JSON.stringify(fullyNamedAbi)
  }
  const contract = await hre.ethers.getContractFactory('MultiverseMetaLand')
  const json = ensureNameFieldInAbiJson(
    contract.interface.format('json') as string
  )
  const events = Object.values(contract.interface.events)
  const eventNames = events.map((fragment) => fragment.name)
  console.log(
    '// This file was automatically generated with "npx hardhat print-abi-lib"\n' +
      '/* eslint-disable @typescript-eslint/no-explicit-any */\n\n' +
      '/** Gets the MultiverseMetaLand ABI as a JSON interface. */\n' +
      'export function getABI(): any[] {\n' +
      `  return ${json}\n` +
      '}\n\n' +
      'export enum Event {\n' +
      eventNames.map((name) => `  ${name} = "${name}",\n`).join('') +
      '}\n\n' +
      'export type EventName = keyof typeof Event\n\n' +
      'export function eventNames(): EventName[] {\n' +
      `  return ["${eventNames.join('", "')}"]\n` +
      '}\n\n' +
      events
        .map(
          (fragment) =>
            `export enum ${fragment.name} {\n` +
            fragment.inputs
              .map((input) => `  ${input.name} = '${input.name}',\n`)
              .join('') +
            '}'
        )
        .join('\n\n')
  )
})

task(
  'print-bytecode-lib',
  'Prints Typescript file exporting the JSON interface of the MultiverseMetaLand contract'
).setAction(async (_args, hre) => {
  const contract = await hre.ethers.getContractFactory('MultiverseMetaLand')
  console.log(
    '// This file was automatically generated with "npx hardhat print-bytecode-lib"\n\n' +
      '/** Gets the MultiverseMetaLand bytecode. This is only intended for testing. */\n' +
      'export function getBytecode(): string {\n' +
      `  return '${contract.bytecode}'\n` +
      '}\n\n'
  )
})

export default {
  solidity: '0.8.9',
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },

  // Note: These URLs use a shared Alchemy API key "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC"
  // from the ethers library for connecting to a non-local ethereum network:
  // https://github.com/ethers-io/ethers.js/blob/de7da421b357b428cc76f41be36eeed68a72135d/packages/providers/src.ts/alchemy-provider.ts
  // This is account is heavily rate-limited. If this is a problem, replace with
  // your own API key (e.g. get a free account) but do not check it into source control.
  networks: {
    hardhat: {},
    mainnet: {
      url: 'https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    },
    homestead: {
      // homestead == mainnet
      url: 'https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    },
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    },
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    },
    goerli: {
      url: 'https://eth-goerli.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    },
    kovan: {
      url: 'https://eth-kovan.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    },
  },
}
