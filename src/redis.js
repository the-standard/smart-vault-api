const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';

const redis = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redis.on('error', err => console.log('Redis Client Error', err));

const getReadyRedis = async _ => {
  if (!redis.isReady) await redis.connect();
  return redis;
}

module.exports = {
  getReadyRedis
};