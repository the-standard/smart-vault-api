const { ethers } = require("ethers");
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
  }
];

const supplyAddress = url => {
  const regex = /^\/supply\?token=(?<token>.*){1}.*$/;
  return url.match(regex) && url.match(regex).groups;
}

const getSupplyData = async url => {
  const token = supplyAddress(url).token
  if (token.toLowerCase() === 'tst') {
    return ethers.utils.parseUnits('1',9).toString();
  } else if (token.toLowerCase() === 'usds') {
    const provider = new ethers.getDefaultProvider(getNetwork('arbitrum').rpc);
    const supply = await new ethers.Contract(
      '0x2Ea0bE86990E8Dac0D09e4316Bb92086F304622d',
      abi,
      provider
    ).totalSupply();
    return ethers.utils.formatEther(supply);
  }
};

module.exports = {
  getSupplyData,
  supplyAddress
};