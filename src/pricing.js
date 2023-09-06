const schedule = require('node-schedule');
const { createClient } = require('redis');
require('ethers');
const { getContract } = require('./contractFactory');
const ethers = require('ethers');
const { getNetworks } = require('./networks');
require('./networks')

let wallet;

const redis = createClient({
  url: 'redis://10.68.1.17:6379'
});
redis.on('error', err => console.log('Redis Client Error', err));

const addNewPrice = async (networkName, token, ts) => {
  const symbol = ethers.decodeBytes32String(token.symbol);
  const chainlinkContract = await getContract(networkName, 'Chainlink', token.clAddr);
  chainlinkContract.connect(wallet).latestRoundData().then(async data => {
    await redis.SADD(`tokens:${networkName}`, symbol);
    await redis.ZADD(`prices:${networkName}:${symbol}`, [{score: ts, value: `${ts}:${data.answer.toString()}`}]);
    await redis.ZREMRANGEBYRANK(`${networkName}:${symbol}`, 0, -49);
  });
}

const schedulePricing = async _ => {
  await redis.connect();
  delay = 0;
  getNetworks().forEach(network => {
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

const getPrices = async _ => {
  const prices = {};
  const networks = getNetworks();

  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    const networkPrices = {};
    const tokens = await redis.SMEMBERS(`tokens:${network.name}`);
    for (let j = 0; j < tokens.length; j++) {
      const token = tokens[j];
      const tokenPrices = (await redis.ZRANGE(`prices:${network.name}:${token}`, 0, 47)).map(priceData => {
        const [ts, price] = priceData.split(':');
        return {ts, price}
      })
      networkPrices[token] = {
        decimals: '8',
        prices: tokenPrices
      };
    }
    
    prices[network.name] = networkPrices;
  }

  return prices;
};

module.exports = {
  getPrices,
  schedulePricing
}