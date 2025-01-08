const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';

const redis = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redis.on('error', err => console.log('Redis Client Error', err));

const limited = async ip => {
  const key = `rateLimit:${ip}`
  const reqLimit = 100;
  if (!redis.isReady) await redis.connect();
  const visits = await redis.INCR(key);
  if (visits === 1) await redis.EXPIRE(key, 60);
  await redis.disconnect();
  return false;
  return visits > reqLimit;
}

module.exports = {
  limited
};