// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "erc721a-upgradeable/contracts/extensions/ERC721ABurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UpgradeTest is Initializable, ERC721AUpgradeable, ERC721ABurnableUpgradeable, ERC2981Upgradeable, OwnableUpgradeable {
  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private supply1x1;
  CountersUpgradeable.Counter private supply2x2;
  CountersUpgradeable.Counter private supply3x3;

  mapping(uint256 => uint256) public mintRates;
  mapping(uint256 => uint256) public landSizes; 
  mapping(uint256 => uint256) public maxSupply;
  mapping(uint256 => bool) public paused;

  uint256 public MAX_MINTS;
  uint256 public MAX_PARCELS;
  string public baseURI;
  string public contractURI;
  bytes32 public merkleRoot;

  //Events
  event Mint(
        uint256 indexed quantity,
        uint256 indexed _landSize,
        address sender
  );
  event Burn(
        uint256 indexed tokenId,
        address sender
  );
  event Withdraw(
        uint256 indexed value,
        address sender
  );

  function __ERC721ABurnableMock_init(string memory name_, string memory symbol_) internal onlyInitializing {
    __ERC721A_init_unchained(name_, symbol_);
  }

  function __ERC721ABurnableMock_init_unchained(string memory, string memory) internal onlyInitializing {}

  function mmlInit() public initializer{
    __ERC721ABurnableMock_init("Multiverse Meta Land Upgrade V2","MMLTEST");
    MAX_MINTS = 5;
    MAX_PARCELS = 1000;
    baseURI = "ipfs://QmUfWksPBpzxbXdunw53DdseC11JDNQXJrBjEAdLVA8D3A/";
    contractURI = "ipfs://QmUfWksPBpzxbXdunw53DdseC11JDNQXJrBjEAdLVA8D3A/contract.json";
    merkleRoot = 0x4f843c8d23c8b94c53a40b0315743d22c1e06fa8a3b95bb549b8afe6bd8ada2c;
    mintRates[1] = 0.2 ether;
    mintRates[2] = 1.12 ether;
    mintRates[3] = 2.52 ether;
    maxSupply[1] = 1100;
    maxSupply[2] = 260;
    maxSupply[3] = 100;
    // Should set royalty after deployed contract
    // setRoyaltyInfo(owner(), 500);
  }

  modifier mintCompliance(uint256 _quantity, uint256 _landSize) {
    require(!getPaused(_landSize), "The contract is paused!");
    require((_landSize >= 1) && (_landSize <= 3), "Incorrect land size");
    require((supply1x1.current() + supply2x2.current() * 4 + supply3x3.current() * 9) <= MAX_PARCELS, "Not enough parcels left");
    mintSupplyCheck(_quantity, _landSize);
    require(_quantity + _numberMinted(msg.sender) <= MAX_MINTS, "Exceeded the limit");
    require(msg.value >= (mintRates[_landSize] * _quantity), "Not enough ether sent");
    _;
    mintSupplyUpdates(_quantity, _landSize);
  }

  function mintSupplyCheck(uint256 _quantity, uint256 _landSize) internal view {
    if(_landSize == 1){
      require(supply1x1.current() + _quantity <= maxSupply[1], "Not enough 1x1 lands left");
    }else if(_landSize == 2){
      require(supply2x2.current() + _quantity <= maxSupply[2], "Not enough 2x2 lands left");
    }else if(_landSize == 3){
      require(supply3x3.current() + _quantity <= maxSupply[3], "Not enough 3x3 lands left");
    }
  }

  function mintSupplyUpdates(uint256 _quantity, uint256 _landSize) internal {
    for (uint256 i = 0; i < _quantity; i++) {
      if(_landSize == 1){
        supply1x1.increment();
        landSizes[_currentIndex - _quantity + i] = 1;
      }else if(_landSize == 2){
        supply2x2.increment();
        landSizes[_currentIndex - _quantity + i] = 2;
      }else if(_landSize == 3){
        supply3x3.increment();
        landSizes[_currentIndex - _quantity + i] = 3;
      }
    }
  }

  function mint(uint256 _quantity, uint256 _landSize) external payable mintCompliance(_quantity, _landSize){
    // // _safeMint's second argument now takes in a quantity, not a tokenId.
    _safeMint(msg.sender, _quantity);
    emit Mint(_quantity, _landSize, msg.sender);
  }

  function whitelistMint(bytes32[] calldata _merkleProof, uint256 _quantity, uint256 _mintRate) external payable mintCompliance(_quantity, _mintRate) {
    bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
    require(
        MerkleProofUpgradeable.verify(_merkleProof, merkleRoot, leaf),
        "Invalid Merkle Proof."
    );
    _safeMint(msg.sender, _quantity);
    emit Mint(_quantity, _mintRate, msg.sender);
  }

  function burn(uint256 tokenId) public override {
    TokenOwnership memory prevOwnership = _ownershipOf(tokenId);

    bool isApprovedOrOwner = (_msgSender() == prevOwnership.addr ||
        isApprovedForAll(prevOwnership.addr, _msgSender()) ||
        getApproved(tokenId) == _msgSender());

    if (!isApprovedOrOwner) revert ('TransferCallerNotOwnerNorApproved');

    _burn(tokenId);
    emit Burn(tokenId, msg.sender);
  }

  function upgradeTest(uint256 num) public pure returns (uint256) {
    return num + 100;
  }

  function exists(uint256 tokenId) public view returns (bool) {
    return _exists(tokenId);
  }

  function getPaused(uint256 _landSize) public view returns(bool){
    return paused[_landSize];
  }

  function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
    return _ownerships[index];
  }

  function totalMinted() public view returns (uint256) {
    return _totalMinted();
  }
  
  function landSizesOf(uint256 _tokenId) public view returns(uint256){
    return landSizes[_tokenId];
  }

  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  function _startTokenId() internal pure override returns (uint256) {
      return 1;
  }

  function _msgSender() internal view override(ContextUpgradeable) returns (address) {
    return msg.sender;
  }

  function _msgData() internal pure override(ContextUpgradeable) returns (bytes calldata) {
    return msg.data;
  }

  function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
    merkleRoot = _merkleRoot;
  }

  function setBaseURI(string memory _uri) public onlyOwner {
    baseURI = _uri;
  }

  function setPaused(uint256 _landSize, bool _state) public onlyOwner {
    paused[_landSize] = _state;
  }

  function setAllPaused(bool _state) public onlyOwner {
    if(_state == true){
      paused[1] = true;
      paused[2] = true;
      paused[3] = true;
    }else{
      paused[1] = false;
      paused[2] = false;
      paused[3] = false;
    }
  }

  function setMintRate(uint256 _landSize, uint256 _number) public onlyOwner {
    mintRates[_landSize] = _number;
  }

  function setMaxSupply(uint256 _landSize, uint256 _number) public onlyOwner {
    maxSupply[_landSize] = _number;
  }

  function setMaxMint(uint256 _number) public {
    MAX_MINTS = _number + 1;
  }

  function setMaxParcel(uint256 _number) public onlyOwner {
    MAX_PARCELS = _number;
  }

  function setRoyaltyInfo(address _receiver, uint96 _royaltyFeesInBips) public onlyOwner {
        _setDefaultRoyalty(_receiver, _royaltyFeesInBips);
    }

  function setContractURI(string calldata _contractURI) public onlyOwner {
      contractURI = _contractURI;
  }

  // The following functions are overrides required by Solidity.
  function supportsInterface(bytes4 interfaceId) public view override(ERC2981Upgradeable, ERC721AUpgradeable) returns (bool)
  {
      return super.supportsInterface(interfaceId);
  }

  function version() public pure returns (uint256) {
    return 2;
  }

  function withdraw() public onlyOwner {
    // This will transfer the remaining contract balance to the owner.
    // Do not remove this otherwise you will not be able to withdraw the funds.
    // =============================================================================
    uint256 valueToEmit = msg.sender.balance; 
    (bool os, ) = payable(owner()).call{value: address(this).balance}("");
    require(os);
    emit Withdraw(valueToEmit, msg.sender);
    // =============================================================================
  }
}