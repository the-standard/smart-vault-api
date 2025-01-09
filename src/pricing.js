const { getNetworks } = require('./networks');
const { redisClient } = require('./redis');

const getTokenPrices = async (networkName, token) => {
  const prices = await redisClient.ZRANGE(`prices:${networkName}:${token}`, 0, 47);
  return prices.map(priceData => {
    const [ts, price] = priceData.split(':');
    return { ts, price };
  });
};

const getNetworkPrices = async (networkName) => {
  const networkPrices = {};
  const tokens = await redisClient.SMEMBERS(`tokens:${networkName}`);
  for (let j = 0; j < tokens.length; j++) {
    const token = tokens[j];
    networkPrices[token] = {
      decimals: '8',
      prices: await getTokenPrices(networkName, token)
    };
  }
  return networkPrices;
};

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
};