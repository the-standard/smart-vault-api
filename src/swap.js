const { ethers } = require('ethers');
const { parseQueryParams } = require('./utils');
const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const TOKEN_MANAGER_ADDRESS = '0x33c5A816382760b6E5fb50d8854a61b3383a32a0';
const WETH_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const RPC = 'https://arb1.arbitrum.io/rpc';

const QUOTER_ABI = [{
  "inputs": [
    {
      "internalType": "address",
      "name": "tokenIn",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "tokenOut",
      "type": "address"
    },
    {
      "internalType": "uint24",
      "name": "fee",
      "type": "uint24"
    },
    {
      "internalType": "uint256",
      "name": "amountIn",
      "type": "uint256"
    },
    {
      "internalType": "uint160",
      "name": "sqrtPriceLimitX96",
      "type": "uint160"
    }
  ],
  "name": "quoteExactInputSingle",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "amountOut",
      "type": "uint256"
    }
  ],
  "stateMutability": "nonpayable",
  "type": "function"
}];

const TOKEN_MANAGER_ABI = [{
  "inputs": [],
  "name": "getAcceptedTokens",
  "outputs": [
    {
      "components": [
        {
          "internalType": "bytes32",
          "name": "symbol",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "addr",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "dec",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "clAddr",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "clDec",
          "type": "uint8"
        }
      ],
      "internalType": "struct ITokenManager.Token[]",
      "name": "",
      "type": "tuple[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}]

const estimateSwapUrl = url => {
  const regex = /^\/estimate_swap(\?(?<queryParams>.*))$/;
  return url.match(regex) && url.match(regex).groups;
}

const getUniswapTokenAddressForSymbol = (tokens, symbol) => {
  const address = tokens.filter(token => ethers.utils.parseBytes32String(token.symbol) === symbol)[0].addr
  return address === ethers.constants.AddressZero ?
    WETH_ADDRESS :
    address;
}

const estimateSwap = async url => {
  try {
    const provider = new ethers.getDefaultProvider(RPC);
    const tokens = await new ethers.Contract(
      TOKEN_MANAGER_ADDRESS,
      TOKEN_MANAGER_ABI,
      provider
    ).getAcceptedTokens();
  
    const quoterContract = new ethers.Contract(
      QUOTER_CONTRACT_ADDRESS,
      QUOTER_ABI,
      provider
    );
  
    const { queryParams } = estimateSwapUrl(url);
    const parsed = parseQueryParams(queryParams);
  
    const inToken = getUniswapTokenAddressForSymbol(tokens, parsed.in);
    const outToken = getUniswapTokenAddressForSymbol(tokens, parsed.out);
  
    return (await quoterContract.callStatic.quoteExactInputSingle(
      inToken,
      outToken,
      3000,
      parsed.amount,
      0
    )).toString();
  } catch (e) {
    return '0';
  }
};

module.exports = {
  estimateSwap,
  estimateSwapUrl
};