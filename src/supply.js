const { ethers, BigNumber } = require("ethers");
const { getNetwork } = require("./networks");
const abi = [
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  }
];

const supplyAddress = url => {
  const regex = /^\/supply\?token=(?<token>\w{3,4}){1}&?(?<furtherParams>.*)?$/;
  return url.match(regex) && url.match(regex).groups;
};

const getTSTReserve = async _ => {
  const ethTST = new ethers.Contract(
    '0xa0b93b9e90ab887e53f9fb8728c009746e989b53',
    abi,
    new ethers.getDefaultProvider(getNetwork('ethereum').rpc)
  )
  const arbTST = new ethers.Contract(
    '0xf5A27E55C748bCDdBfeA5477CB9Ae924f0f7fd2e',
    abi,
    new ethers.getDefaultProvider(getNetwork('arbitrum').rpc)
  )

  return [
    ... await Promise.all([
      '0xf0A13763a2102A6EA036078C602F154A2a5eEc7A',
      '0x577ee996ABdb92e34b5eeC6E2525b93BdED5EcDd',
      '0x6DFC67184D872A6761e0979A29bE8CA29Cf01A58'
    ].map(async addr => {
      return await ethTST.balanceOf(addr);
    })),
    ... await Promise.all([
      '0x99d5D7C8F40Deba9d0075E8Fff2fB13Da787996a',
      '0x12A38bF3Ae73FDa788ebdE9e2D165FA1634CB95F'
    ].map(async addr => {
      return await arbTST.balanceOf(addr);
    }))
  ].reduce((a,b) => a.add(b), BigNumber.from(0));
};

const getSupplyData = async url => {
  const { token, furtherParams } = supplyAddress(url);
  let supply;
  if (token.toLowerCase() === 'tst') {
    supply = ethers.utils.parseEther('1000000000');
    if (furtherParams && furtherParams.split('&').includes('circulating=true')) {
      supply = supply.sub(await getTSTReserve());
    }
  } else if (token.toLowerCase() === 'usds') {
    const provider = new ethers.getDefaultProvider(getNetwork('arbitrum').rpc);
    supply = await new ethers.Contract(
      '0x2Ea0bE86990E8Dac0D09e4316Bb92086F304622d',
      abi,
      provider
    ).totalSupply();
  }
  return ethers.utils.formatEther(supply);
};

module.exports = {
  getSupplyData,
  supplyAddress
};