// This file was automatically generated with "npx hardhat print-abi-lib"
/* eslint-disable @typescript-eslint/no-explicit-any */

/** Gets the MultiverseMetaLand ABI as a JSON interface. */
export function getABI(): any[] {
  return [{"type":"error","name":"ApprovalCallerNotOwnerNorApproved","inputs":[]},{"type":"error","name":"ApprovalQueryForNonexistentToken","inputs":[]},{"type":"error","name":"ApprovalToCurrentOwner","inputs":[]},{"type":"error","name":"ApproveToCaller","inputs":[]},{"type":"error","name":"BalanceQueryForZeroAddress","inputs":[]},{"type":"error","name":"MintToZeroAddress","inputs":[]},{"type":"error","name":"MintZeroQuantity","inputs":[]},{"type":"error","name":"OwnerQueryForNonexistentToken","inputs":[]},{"type":"error","name":"TransferCallerNotOwnerNorApproved","inputs":[]},{"type":"error","name":"TransferFromIncorrectOwner","inputs":[]},{"type":"error","name":"TransferToNonERC721ReceiverImplementer","inputs":[]},{"type":"error","name":"TransferToZeroAddress","inputs":[]},{"type":"error","name":"URIQueryForNonexistentToken","inputs":[]},{"type":"event","anonymous":false,"name":"Approval","inputs":[{"type":"address","name":"owner","indexed":true},{"type":"address","name":"approved","indexed":true},{"type":"uint256","name":"tokenId","indexed":true}]},{"type":"event","anonymous":false,"name":"ApprovalForAll","inputs":[{"type":"address","name":"owner","indexed":true},{"type":"address","name":"operator","indexed":true},{"type":"bool","name":"approved","indexed":false}]},{"type":"event","anonymous":false,"name":"Burn","inputs":[{"type":"uint256","name":"tokenId","indexed":true},{"type":"address","name":"sender","indexed":false}]},{"type":"event","anonymous":false,"name":"Mint","inputs":[{"type":"uint256","name":"quantity","indexed":true},{"type":"uint256","name":"landSize","indexed":true},{"type":"uint256","name":"startingTokenId","indexed":true},{"type":"address","name":"sender","indexed":false}]},{"type":"event","anonymous":false,"name":"OwnershipTransferred","inputs":[{"type":"address","name":"previousOwner","indexed":true},{"type":"address","name":"newOwner","indexed":true}]},{"type":"event","anonymous":false,"name":"Transfer","inputs":[{"type":"address","name":"from","indexed":true},{"type":"address","name":"to","indexed":true},{"type":"uint256","name":"tokenId","indexed":true}]},{"type":"event","anonymous":false,"name":"Withdraw","inputs":[{"type":"uint256","name":"value","indexed":true},{"type":"address","name":"sender","indexed":false}]},{"type":"function","name":"MAX_MINTS","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"MAX_PARCELS","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"approve","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"address","name":"to"},{"type":"uint256","name":"tokenId"}],"outputs":[]},{"type":"function","name":"balanceOf","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"address","name":"owner"}],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"baseURI","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"string","name":""}]},{"type":"function","name":"burn","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"tokenId"}],"outputs":[]},{"type":"function","name":"contractURI","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"string","name":""}]},{"type":"function","name":"exists","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"tokenId"}],"outputs":[{"type":"bool","name":""}]},{"type":"function","name":"getApproved","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"tokenId"}],"outputs":[{"type":"address","name":""}]},{"type":"function","name":"getOwnershipAt","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"index"}],"outputs":[{"type":"tuple","components":[{"type":"address","name":"addr"},{"type":"uint64","name":"startTimestamp"},{"type":"bool","name":"burned"}],"name":""}]},{"type":"function","name":"getPaused","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"_landSize"}],"outputs":[{"type":"bool","name":""}]},{"type":"function","name":"isApprovedForAll","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"address","name":"owner"},{"type":"address","name":"operator"}],"outputs":[{"type":"bool","name":""}]},{"type":"function","name":"landSizes","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":""}],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"landSizesOf","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"_tokenId"}],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"maxSupply","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":""}],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"merkleRoot","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"bytes32","name":""}]},{"type":"function","name":"mint","constant":false,"stateMutability":"payable","payable":true,"gas":29000000,"inputs":[{"type":"uint256","name":"_quantity"},{"type":"uint256","name":"_landSize"}],"outputs":[]},{"type":"function","name":"mintRates","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":""}],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"mmlInit","constant":false,"payable":false,"gas":29000000,"inputs":[],"outputs":[]},{"type":"function","name":"name","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"string","name":""}]},{"type":"function","name":"owner","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"address","name":""}]},{"type":"function","name":"ownerOf","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"tokenId"}],"outputs":[{"type":"address","name":""}]},{"type":"function","name":"paused","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":""}],"outputs":[{"type":"bool","name":""}]},{"type":"function","name":"renounceOwnership","constant":false,"payable":false,"gas":29000000,"inputs":[],"outputs":[]},{"type":"function","name":"royaltyInfo","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"_tokenId"},{"type":"uint256","name":"_salePrice"}],"outputs":[{"type":"address","name":""},{"type":"uint256","name":""}]},{"type":"function","name":"safeTransferFrom","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"address","name":"from"},{"type":"address","name":"to"},{"type":"uint256","name":"tokenId"}],"outputs":[]},{"type":"function","name":"safeTransferFrom","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"address","name":"from"},{"type":"address","name":"to"},{"type":"uint256","name":"tokenId"},{"type":"bytes","name":"_data"}],"outputs":[]},{"type":"function","name":"setAllPaused","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"bool","name":"_state"}],"outputs":[]},{"type":"function","name":"setApprovalForAll","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"address","name":"operator"},{"type":"bool","name":"approved"}],"outputs":[]},{"type":"function","name":"setBaseURI","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"string","name":"_uri"}],"outputs":[]},{"type":"function","name":"setContractURI","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"string","name":"_contractURI"}],"outputs":[]},{"type":"function","name":"setMaxMints","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"_number"}],"outputs":[]},{"type":"function","name":"setMaxParcels","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"_number"}],"outputs":[]},{"type":"function","name":"setMaxSupply","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"_landSize"},{"type":"uint256","name":"_number"}],"outputs":[]},{"type":"function","name":"setMerkleRoot","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"bytes32","name":"_merkleRoot"}],"outputs":[]},{"type":"function","name":"setMintRates","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"_landSize"},{"type":"uint256","name":"_number"}],"outputs":[]},{"type":"function","name":"setPaused","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"_landSize"},{"type":"bool","name":"_state"}],"outputs":[]},{"type":"function","name":"setRoyaltyInfo","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"address","name":"_receiver"},{"type":"uint96","name":"_royaltyFeesInBips"}],"outputs":[]},{"type":"function","name":"supportsInterface","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"bytes4","name":"interfaceId"}],"outputs":[{"type":"bool","name":""}]},{"type":"function","name":"symbol","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"string","name":""}]},{"type":"function","name":"tokenURI","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[{"type":"uint256","name":"tokenId"}],"outputs":[{"type":"string","name":""}]},{"type":"function","name":"totalMinted","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"totalSupply","constant":true,"stateMutability":"view","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"transferFrom","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"address","name":"from"},{"type":"address","name":"to"},{"type":"uint256","name":"tokenId"}],"outputs":[]},{"type":"function","name":"transferOwnership","constant":false,"payable":false,"gas":29000000,"inputs":[{"type":"address","name":"newOwner"}],"outputs":[]},{"type":"function","name":"version","constant":true,"stateMutability":"pure","payable":false,"gas":29000000,"inputs":[],"outputs":[{"type":"uint256","name":""}]},{"type":"function","name":"whitelistMint","constant":false,"stateMutability":"payable","payable":true,"gas":29000000,"inputs":[{"type":"bytes32[]","name":"_merkleProof"},{"type":"uint256","name":"_quantity"},{"type":"uint256","name":"_landSize"}],"outputs":[]},{"type":"function","name":"withdraw","constant":false,"payable":false,"gas":29000000,"inputs":[],"outputs":[]}]
}

export enum Event {
  Approval = "Approval",
  ApprovalForAll = "ApprovalForAll",
  Burn = "Burn",
  Mint = "Mint",
  OwnershipTransferred = "OwnershipTransferred",
  Transfer = "Transfer",
  Withdraw = "Withdraw",
}

export type EventName = keyof typeof Event

export function eventNames(): EventName[] {
  return ["Approval", "ApprovalForAll", "Burn", "Mint", "OwnershipTransferred", "Transfer", "Withdraw"]
}

export enum Approval {
  owner = 'owner',
  approved = 'approved',
  tokenId = 'tokenId',
}

export enum ApprovalForAll {
  owner = 'owner',
  operator = 'operator',
  approved = 'approved',
}

export enum Burn {
  tokenId = 'tokenId',
  sender = 'sender',
}

export enum Mint {
  quantity = 'quantity',
  landSize = 'landSize',
  startingTokenId = 'startingTokenId',
  sender = 'sender',
}

export enum OwnershipTransferred {
  previousOwner = 'previousOwner',
  newOwner = 'newOwner',
}

export enum Transfer {
  from = 'from',
  to = 'to',
  tokenId = 'tokenId',
}

export enum Withdraw {
  value = 'value',
  sender = 'sender',
}
