const schedule = require('node-schedule');
require('ethers');
const { getContract } = require('./contractFactory');
const ethers = require('ethers');

let prices = {};

const addPriceToToken = (symbol, data, ts) => {
  prices[symbol].prices = [ 
    ...prices[symbol].prices, {
      price: data.answer,
      ts: ts
    }
  ].splice(-48, 48);
}

const addNewToken = (symbol, data, ts, chainlinkContract) => {
  chainlinkContract.methods.decimals().call().then(dec => {
    prices[symbol] = {
      decimals: dec,
      prices: [{
        price: data.answer, 
        ts: ts
      }]
    }
  });
}

const addNewPrice = async (token, ts) => {
  const symbol = ethers.decodeBytes32String(token.symbol);
  const chainlinkContract = await getContract('Chainlink', token.clAddr);
  (chainlinkContract).methods.latestRoundData().call().then(data => {
    if (prices[symbol]) {
      addPriceToToken(symbol, data, ts)
    } else {
      addNewToken(symbol, data, ts, chainlinkContract)
    }
  });
}

const schedulePricing = async _ => {
  schedule.scheduleJob('0,30 * * * *', async _ => {
    const ts = Math.floor(new Date() / 1000);
    (await getContract('TokenManager')).methods.getAcceptedTokens().call().then(tokens => {
      tokens.map(token => {
        addNewPrice(token, ts);
      });
    });
  });
};

const getPrices = _ => prices;

module.exports = {
  getPrices,
  schedulePricing
}