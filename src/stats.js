const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';

const redis = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redis.on('error', err => console.log('Redis Client Error', err));

const getStats = async _ => {
  await redis.connect();
  const assets = await redis.SMEMBERS('assets');
  const tvl = [];
  for (let i = 0; i < assets.length; i++) {
    tvl.push({address: assets[i], amount: await redis.GET(`tvl:${assets[i]}`)});
  }
  await redis.disconnect();
  return {tvl}
}

module.exports = {
  getStats
}