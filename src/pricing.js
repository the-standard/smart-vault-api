const schedule = require('node-schedule');
require('ethers');
const { getContract } = require('./contractFactory');
const ethers = require('ethers');
const { getNetworks } = require('./networks');
require('./networks')

let prices = {};
let wallet;

const addPriceToToken = (symbol, data, ts, networkName) => {
  prices[networkName][symbol].prices = [ 
    ...prices[networkName][symbol].prices, {
      price: data.answer.toString(),
      ts: ts
    }
  ].splice(-48, 48);
}

const addNewToken = (symbol, data, ts, chainlinkContract, networkName) => {
  chainlinkContract.connect(wallet).decimals().then(dec => {
    prices[networkName][symbol] = {
      decimals: dec.toString(),
      prices: [{
        price: data.answer.toString(), 
        ts: ts
      }]
    }
  });
}

const addNewPrice = async (networkName, token, ts) => {
  const symbol = ethers.decodeBytes32String(token.symbol);
  const chainlinkContract = await getContract(networkName, 'Chainlink', token.clAddr);
  chainlinkContract.connect(wallet).latestRoundData().then(data => {
    if (prices[networkName][symbol]) {
      addPriceToToken(symbol, data, ts, networkName)
    } else {
      addNewToken(symbol, data, ts, chainlinkContract, networkName)
    }
  });
}

const schedulePricing = async _ => {
  delay = 0;
  getNetworks().forEach(network => {
    prices[network.name] = {};
    schedule.scheduleJob(`${delay} */30 * * * *`, async _ => {
      const provider = new ethers.getDefaultProvider(network.rpc)
      wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
      const ts = Math.floor(new Date() / 1000);
      (await getContract(network.name, 'TokenManager')).connect(wallet).getAcceptedTokens().then(tokens => {
        tokens.map(token => {
          addNewPrice(network.name, token, ts);
        });
      }).catch(console.log);
    });
    delay += 10;
  });
};

const getPrices = _ => prices;

module.exports = {
  getPrices,
  schedulePricing
}