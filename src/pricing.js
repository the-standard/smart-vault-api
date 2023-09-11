const { createClient } = require('redis');
require('ethers');
const { getNetworks } = require('./networks');
require('./networks')

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';

const redis = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redis.on('error', err => console.log('Redis Client Error', err));

const getTokenPrices = async (networkName, token) => {
  const prices = await redis.ZRANGE(`prices:${networkName}:${token}`, 0, 47);
  return prices.map(priceData => {
    const [ts, price] = priceData.split(':');
    return {ts, price}
  })
}

const getNetworkPrices = async (networkName) => {
  const networkPrices = {};
    await redis.connect();
    const tokens = await redis.SMEMBERS(`tokens:${networkName}`);
    for (let j = 0; j < tokens.length; j++) {
      const token = tokens[j];
      networkPrices[token] = {
        decimals: '8',
        prices: await getTokenPrices(networkName, token)
      };
    }
    await redis.disconnect();
    return networkPrices;
}

const getPrices = async _ => {
  const prices = {};
  const networks = getNetworks();
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    prices[network.name] = await getNetworkPrices(network.name);
  }
  return prices;
};

module.exports = {
  getPrices
}