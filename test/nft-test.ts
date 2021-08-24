/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, use } from 'chai'
import { waffleChai } from '@ethereum-waffle/chai'
import { ethers, upgrades } from 'hardhat'
import { Contract, Event, utils, ContractFactory } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

// Expectations for ethers types (e.g. BigNumber)
use(waffleChai)

const initialSupply = 0
const testMintRatesInEth: Record<number, string> = {
  1: '0.2',
  2: '1.12',
  3: '2.52',
}
const testMintRates = Object.fromEntries(
  Object.entries(testMintRatesInEth).map(([lotSize, rate]) => [
    lotSize,
    utils.parseEther(rate),
  ])
)
const testMaxSupply: Record<number, number> = {
  1: 1100,
  2: 260,
  3: 100,
}

describe('MultiverseMetaLand Smart Contract', () => {
  let nft: Contract
  let owner: SignerWithAddress
  let account1: SignerWithAddress

  beforeEach(async () => {
    ;[owner, account1] = await ethers.getSigners()
    
    const MultiverseMetaLand = await ethers.getContractFactory(
      'MultiverseMetaLand'
    )
    nft = await upgrades.deployProxy(MultiverseMetaLand, [], { initializer: 'mmlInit' })
    await nft.deployed()
    const receipt = await nft.deployTransaction.wait()
  })

  it.only('has expected initial state', async () => {
    expect(await nft.owner()).to.equal(owner.address)
    expect(await nft.name()).to.equal('Multiverse Meta Land')
    expect(await nft.symbol()).to.equal('MML')
    expect(await nft.version()).to.equal(1)
    expect(await nft.totalSupply()).to.equal(initialSupply)
    expect((await nft.royaltyInfo(1000, 100))[1]).to.equal(5)
    expect(await nft.MAX_MINTS()).to.equal(10)
    expect(await nft.MAX_PARCELS()).to.equal(10000)
    expect(await nft.baseURI()).to.equal("ipfs://QmUfWksPBpzxbXdunw53DdseC11JDNQXJrBjEAdLVA8D3A/")
    expect(await nft.contractURI()).to.equal("ipfs://QmUfWksPBpzxbXdunw53DdseC11JDNQXJrBjEAdLVA8D3A/contract.json")
    expect(await nft.merkleRoot()).to.equal('0x592916eaff17dc919281fb1dbb9d5aebbe42104610485f1315f823ef1379af2e')
    for (let index = 0; index < 5; index += 1) {
      expect(utils.formatEther(await nft.mintRates(index))).to.equal(
        testMintRatesInEth[index] || '0.0'
      )
    }

    for (let index = 0; index < 5; index += 1) {
      expect(await nft.maxSupply(index)).to.equal(testMaxSupply[index] || 0)
    }

    expect(await nft.getPaused(1)).to.equal(false)
    expect(await nft.getPaused(2)).to.equal(false)
    expect(await nft.getPaused(3)).to.equal(false)
  })

  describe('minting', () => {
    for (let size = 1; size <= 3; size += 1) {
      for (let quantity = 1; quantity <= 10; quantity += 1) {
        it(`can mint ${quantity} ${size}x${size} successfully`, async () => {
          const ethBalanceBefore = await account1.getBalance()

          const txPromise = nft.connect(account1).mint(quantity, size, {
            value: testMintRates[size].mul(quantity),
          })

          // Verify NFT balance change
          expect(() => txPromise).to.changeTokenBalance(nft, account1, quantity)

          const tx = await txPromise
          const receipt = await tx.wait()

          // Verify transfer events, Transfer event + Mint event
          expect(receipt.events).to.have.length(quantity + 1)

          //Check Transfer Event
          const transferEvents: Event[] = receipt.events.filter(
            (e: Event) => e.event === 'Transfer'
          )
          expect(transferEvents).to.have.length(quantity)
          expect(transferEvents[0].args).to.have.length(3)
          expect(transferEvents[0].args?.[1]).to.equal(account1.address)

          //Check Mint Event
          const mintEvents: Event[] = await receipt.events.filter(
            (e: Event) => e.event === 'Mint'
          )
          expect(mintEvents).to.have.length(1)
          expect(mintEvents[0].args).to.have.length(4)
          expect(mintEvents[0].args?.[0]).to.equal(quantity)
          expect(mintEvents[0].args?.[1]).to.equal(size)
          expect(mintEvents[0].args?.[2]).to.equal(1) // startTokenId is 1
          expect(mintEvents[0].args?.[3]).to.equal(account1.address)

          const ethBalanceAfter = await account1.getBalance()

          // Verify ether spent
          expect(ethBalanceBefore.sub(ethBalanceAfter)).to.be.gt(
            testMintRates[size].mul(quantity)
          )
          expect(transferEvents[0].args).to.have.length(3)

          // Mint another to verify Mint event startingTokenId
          const tx2 = await nft.connect(owner).mint(3, 1, {
            value: testMintRates[1].mul(3),
          })
          const receipt2 = await tx2.wait()
          const mintEvents2: Event[] = await receipt2.events.filter(
            (e: Event) => e.event === 'Mint'
          )
          expect(mintEvents2).to.have.length(1)
          expect(mintEvents2[0].args).to.have.length(4)
          expect(mintEvents2[0].args?.[0]).to.equal(3)
          expect(mintEvents2[0].args?.[1]).to.equal(1)
          expect(mintEvents2[0].args?.[2]).to.equal(1 + quantity) // startTokenId is 1
          expect(mintEvents2[0].args?.[3]).to.equal(owner.address)
        })
      }
    }

    for (let size = 1; size <= 3; size += 1) {
      it(`does not allow minting more than 10 ${size}x${size} at once`, async () => {
        await expect(
          nft.connect(account1).mint(11, size, {
            value: testMintRates[size].mul(11),
          })
        ).to.be.revertedWith('Exceeded the limit')
      })
    }

    for (let size = 1; size <= 3; size += 1) {
      it(`does not allow minting additional ${size}x${size} after 10 have been minted for the user`, async () => {
        // Mint 10 successfully
        nft.connect(account1).mint(10, size, {
          value: testMintRates[size].mul(10),
        })

        // 11th should fail
        await expect(
          nft.connect(account1).mint(1, size, {
            value: testMintRates[size].mul(1),
          })
        ).to.be.revertedWith('Exceeded the limit')
      })
    }

    it('does not allow minting when insufficient eth sent', async () => {
      // Mint 2 1x1 but only pay for 1 1x1
      await expect(
        nft.connect(account1).mint(2, 1, { value: testMintRates[1].mul(1) })
      ).to.be.revertedWith('Not enough ether sent')
    })
  })

  describe('whitelist minting', () => {
    //Whitelist mint has same logic as mint, so just test the merkle proof validation is enough. 
    //Front end should provide correct valid merkle proof, so we don't test valid merkle proof here.
        it(`can whitelist mint successfully`, async () => {
          let merkleProof = [
            '0xafe7c546eb582218cf94b848c36f3b058e2518876240ae6100c4ef23d38f3e07',
            '0xe6fc773c42a28ab3ea8ef1d93c99ceb3d6591b7bfd4518e1d56376edf55a106c',
            '0xafdc1a501228714b044ab971ae94c1606f2ebf005c44b2b9b79d0c0ea24f12ca',
            '0x999bf57501565dbd2fdcea36efa2b9aef8340a8901e3459f4a4c926275d36cdb'
          ];
          
          const ethBalanceBefore = await account1.getBalance()

          const txPromise = nft.connect(account1).whitelistMint(merkleProof, 9, 3, {
            value: testMintRates[3].mul(9),
          })

          // Verify NFT balance change
          expect(() => txPromise).to.changeTokenBalance(nft, account1, 9)

          const tx = await txPromise
          const receipt = await tx.wait()

          // Verify transfer events, Transfer event + Mint event
          expect(receipt.events).to.have.length(9 + 1)

          //Check Transfer Event
          const transferEvents: Event[] = receipt.events.filter(
            (e: Event) => e.event === 'Transfer'
          )
          expect(transferEvents).to.have.length(9)
          expect(transferEvents[0].args).to.have.length(3)
          expect(transferEvents[0].args?.[1]).to.equal(account1.address)

          //Check Mint Event
          const mintEvents: Event[] = await receipt.events.filter(
            (e: Event) => e.event === 'Mint'
          )
          expect(mintEvents).to.have.length(1)
          expect(mintEvents[0].args).to.have.length(4)
          expect(mintEvents[0].args?.[0]).to.equal(9)
          expect(mintEvents[0].args?.[1]).to.equal(3)
          expect(mintEvents[0].args?.[2]).to.equal(1) // startTokenId is 1
          expect(mintEvents[0].args?.[3]).to.equal(account1.address)

          const ethBalanceAfter = await account1.getBalance()

          // Verify ether spent
          expect(ethBalanceBefore.sub(ethBalanceAfter)).to.be.gt(
            testMintRates[3].mul(9)
          )
          expect(transferEvents[0].args).to.have.length(3)

          // Mint another to verify Mint event startingTokenId
          const tx2 = await nft.connect(owner).mint(3, 1, {
            value: testMintRates[1].mul(3),
          })
          const receipt2 = await tx2.wait()
          const mintEvents2: Event[] = await receipt2.events.filter(
            (e: Event) => e.event === 'Mint'
          )
          expect(mintEvents2).to.have.length(1)
          expect(mintEvents2[0].args).to.have.length(4)
          expect(mintEvents2[0].args?.[0]).to.equal(3)
          expect(mintEvents2[0].args?.[1]).to.equal(1)
          expect(mintEvents2[0].args?.[2]).to.equal(1 + 9) // startTokenId is 1
          expect(mintEvents2[0].args?.[3]).to.equal(owner.address)
        })

        it(`cannot whitelist mint if not in the whitelist(Even owner cannot mint)`, async () => {
          let merkleProof = [
            '0xafe7c546eb582218cf94b848c36f3b058e2518876240ae6100c4ef23d38f3e07',
            '0xe6fc773c42a28ab3ea8ef1d93c99ceb3d6591b7bfd4518e1d56376edf55a106c',
            '0xafdc1a501228714b044ab971ae94c1606f2ebf005c44b2b9b79d0c0ea24f12ca',
            '0x999bf57501565dbd2fdcea36efa2b9aef8340a8901e3459f4a4c926275d36cdb'
          ];
          
          expect(nft.connect(owner).whitelistMint(merkleProof, 9, 3, {
            value: testMintRates[3].mul(9),
          })).to.be.revertedWith('Invalid Merkle Proof.')
        })
  })

  describe('burn', () => {
    beforeEach(async () => {
      const mintTx = await nft.connect(account1).mint(5, 3, {
        value: testMintRates[3].mul(5),
      })
      await mintTx.wait()
    })

    it('burn token successfully', async () => {
      // check total supply = 5, and total minted = 5, tokenId 3 exists
      expect(await nft.exists(1)).to.equal(true)
      expect(await nft.exists(2)).to.equal(true)
      expect(await nft.exists(3)).to.equal(true)
      expect(await nft.exists(4)).to.equal(true)
      expect(await nft.exists(5)).to.equal(true)
      expect(await nft.totalSupply()).to.equal(5)
      expect(await nft.totalMinted()).to.equal(5)

      await nft.connect(account1).burn(3)

      // expect tokenId burned, total supply = 4, total minted = 5
      expect(await nft.exists(1)).to.equal(true)
      expect(await nft.exists(2)).to.equal(true)
      expect(await nft.exists(3)).to.equal(false)
      expect(await nft.exists(4)).to.equal(true)
      expect(await nft.exists(5)).to.equal(true)
      expect(await nft.totalSupply()).to.equal(4)
      expect(await nft.totalMinted()).to.equal(5)

      //mint new token, with incremented id after 5.
      const mintTx = await nft.connect(owner).mint(5, 3, {
        value: testMintRates[3].mul(5),
      })
      await mintTx.wait()
      expect(await nft.exists(6)).to.equal(true)
      expect(await nft.exists(7)).to.equal(true)
      expect(await nft.exists(8)).to.equal(true)
      expect(await nft.exists(9)).to.equal(true)
      expect(await nft.exists(10)).to.equal(true)

      //burn after 2nd minted
      await nft.connect(owner).burn(9)
      expect(await nft.exists(6)).to.equal(true)
      expect(await nft.exists(7)).to.equal(true)
      expect(await nft.exists(8)).to.equal(true)
      expect(await nft.exists(9)).to.equal(false)
      expect(await nft.exists(10)).to.equal(true)

      // someone other than the owner of the token attempt to burn, should fail
      await expect(nft.connect(account1).burn(8)).to.be.revertedWith(
        'TransferCallerNotOwnerNorApproved'
      )
    })
  })

  describe('pause functionality', () => {
    it('prevents non-owner from pausing contract', async () => {
      await expect(nft.connect(account1).setPaused(1, true)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('cannot mint land size X if its paused flag is true, but can mint other land size if its paused flag is false', async () => { 
      await nft.connect(owner).setPaused(1,true)
      //even owner cannot mint
      await expect(
        nft.connect(owner).mint(5, 1, {
          value: testMintRates[1].mul(5),
        })
      ).to.be.revertedWith('The contract is paused!')
      //user can mint if not paused
      const mintTx = await nft.connect(account1).mint(5, 3, {
        value: testMintRates[3].mul(5),
      })
      await mintTx.wait()

      //check if we mint the token size correctly
      expect(await nft.totalSupply()).to.equal(5)
      expect(await nft.landSizesOf(5)).to.equal(3)
    })
  })

  describe('setters', () => {
    it('Setter(paused)', async () => {
      await expect(nft.connect(account1).setAllPaused(true)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setAllPaused(true)
      expect(await nft.paused(1)).to.eql(true)
      expect(await nft.paused(2)).to.eql(true)
      expect(await nft.paused(3)).to.eql(true)
      await expect(nft.connect(account1).setPaused(1, true)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setPaused(1, false)
      expect(await nft.paused(1)).to.eql(false)
      await nft.connect(owner).setPaused(2, false)
      expect(await nft.paused(2)).to.eql(false)
      await nft.connect(owner).setPaused(3, false)
      expect(await nft.paused(3)).to.eql(false)
    })

    it('Setter(baseURI)', async () => {
      expect(await nft.baseURI()).to.eql('ipfs://QmUfWksPBpzxbXdunw53DdseC11JDNQXJrBjEAdLVA8D3A/')
      await expect(nft.connect(account1).setBaseURI('testURI')).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setBaseURI('testURI')
      expect(await nft.baseURI()).to.eql('testURI')
    })

    it('Setter(contractURI)', async () => {
      expect(await nft.contractURI()).to.equal('ipfs://QmUfWksPBpzxbXdunw53DdseC11JDNQXJrBjEAdLVA8D3A/contract.json')
      await expect(nft.connect(account1).setBaseURI('testContractURI')).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setContractURI('testContractURI')
      expect(await nft.contractURI()).to.equal('testContractURI')
    })

    it('Setter(MAX_MINTS)', async () => {
      expect(await nft.MAX_MINTS()).to.equal(10)
      await expect(nft.connect(account1).setMaxMints(5)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setMaxMints(5)
      expect(await nft.MAX_MINTS()).to.equal(5)
    })

    it('Setter(MAX_PARCELS)', async () => {
      expect(await nft.MAX_PARCELS()).to.equal(10000)
      await expect(nft.connect(account1).setMaxParcels(5000)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setMaxParcels(5000)
      expect(await nft.MAX_PARCELS()).to.equal(5000)
    })

    it('Setter(maxSupply)', async () => {
      expect(await nft.maxSupply(1)).to.equal(1100)
      await expect(nft.connect(account1).setMaxSupply(1, 5000)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setMaxSupply(1, 1000)
      expect(await nft.maxSupply(1)).to.equal(1000)
      await nft.connect(owner).setMaxSupply(2, 2000)
      expect(await nft.maxSupply(2)).to.equal(2000)
      await nft.connect(owner).setMaxSupply(3, 3000)
      expect(await nft.maxSupply(3)).to.equal(3000)
    })

    it('Setter(merkleRoot)', async () => {
      let bytes32 = utils.defaultAbiCoder.encode(['uint256'], ['0x4f843c8d23c8b94c53a40b0315743d22c1e06fa8a3b95bb549b8afe6bd8ccccc']);
      expect(await nft.merkleRoot()).to.equal('0x4f843c8d23c8b94c53a40b0315743d22c1e06fa8a3b95bb549b8afe6bd8ada2c')
      await expect(nft.connect(account1).setMerkleRoot(bytes32)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setMerkleRoot(bytes32)
      expect(await nft.merkleRoot()).to.equal(bytes32)
    })

    it('Setter(mintRates)', async () => {
      expect(await nft.mintRates(1)).to.equal(utils.parseEther('0.2'))
      expect(await nft.mintRates(2)).to.equal(utils.parseEther('1.12'))
      expect(await nft.mintRates(3)).to.equal(utils.parseEther('2.52'))
      await expect(nft.connect(account1).setMintRates(1, utils.parseEther('0.12'))).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setMintRates(1, utils.parseEther('0.12'))
      expect(await nft.mintRates(1)).to.equal(utils.parseEther('0.12'))
    })

    it('Setter(RoyaltyInfo))', async () => {
      expect((await nft.royaltyInfo(1, 100))[1]).to.equal(5)
      await expect(nft.connect(account1).setRoyaltyInfo(account1.address, 200)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
      await nft.connect(owner).setRoyaltyInfo(account1.address, 200)
      expect((await nft.royaltyInfo(1, 100))[1]).to.equal(2)
    })


  })

  describe('withdrawal', () => {
    beforeEach(async () => {
      const mintTx = await nft.connect(account1).mint(5, 3, {
        value: testMintRates[3].mul(5),
      })
      await mintTx.wait()
    })

    it('allows owner to withdraw funds', async () => {
      const ownerEthBalanceBefore = await owner.getBalance()
      const contractEthBalanceBefore = await ethers.provider.getBalance(
        nft.address
      )

      const withdrawTx = await nft.connect(owner).withdraw()
      await withdrawTx.wait()

      const ownerEthBalanceAfter = await owner.getBalance()
      const contractEthBalanceAfter = await ethers.provider.getBalance(
        nft.address
      )

      const totalEth = testMintRates[3].mul(5)

      expect(contractEthBalanceBefore).to.equal(totalEth)
      expect(contractEthBalanceAfter).to.equal(0)

      expect(ownerEthBalanceAfter.sub(ownerEthBalanceBefore)).to.be.closeTo(
        totalEth,
        utils.parseEther('0.001')
      )
    })

    it('prevents non-owner from withdrawing funds', async () => {
      await expect(nft.connect(account1).withdraw()).to.be.revertedWith(
        'caller is not the owner'
      )
    })
  })
})



describe('MML deploy proxy and upgrade', function () {
  let MML:ContractFactory
  let mmlProxy: Contract
  let owner: SignerWithAddress
  let account1: SignerWithAddress

  beforeEach(async function () {
    MML = await ethers.getContractFactory("MultiverseMetaLand")
    mmlProxy = await upgrades.deployProxy(MML, [], { initializer: 'mmlInit' })
    ;[owner, account1] = await ethers.getSigners()
  })

  it('Initialized states, mint 5 tokens', async function () {
    await mmlProxy.deployed()
    
    //which needs to be filled in upgradeProxy()
    console.log(mmlProxy.address)

    expect(await mmlProxy.name()).to.equal("Multiverse Meta Land")
    expect(await mmlProxy.MAX_MINTS()).to.equal(10)
    expect(await mmlProxy.totalSupply()).to.equal(0)
    await mmlProxy.connect(account1).mint(4, 1, {value: testMintRates[1].mul(4)})
    expect(await mmlProxy.totalSupply()).to.equal(4)
  })

  it('upgrades', async function () {
    const MMLV2 = await ethers.getContractFactory("UpgradeTest")
    mmlProxy = await upgrades.upgradeProxy("0x4b6aB5F819A515382B0dEB6935D793817bB4af28", MMLV2)
    await mmlProxy.deployed()
    //init function cannot access through upgrade, so still 10 MAX MINTS instead of 5.
    expect(await mmlProxy.MAX_MINTS()).to.equal(10)

    //check new function and modified old function in the contract
    expect(await mmlProxy.upgradeTest(1)).to.equal(101)
    await mmlProxy.connect(owner).setMaxMint(4)

    //check totalSupply equals old contract's totalSupply
    expect(await mmlProxy.totalSupply()).to.equal(4)

    //account1 can mint only 1 more
    await mmlProxy.connect(account1).mint(1, 1, {value: testMintRates[1].mul(1),})
    await expect(mmlProxy.connect(account1).mint(1, 1, {value: testMintRates[1].mul(1),})).to.be.revertedWith('Exceeded the limit')
  })
})