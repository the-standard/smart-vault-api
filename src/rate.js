const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';

const redis = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redis.on('error', err => console.log('Redis Client Error', err));

const limited = async ip => {
  console.log(1)
  console.log(ip)
  const key = `rateLimit:${ip}`
  console.log(2)
  const reqLimit = 10;
  console.log(3)
  await redis.connect();
  console.log(4)
  const [ visits ] = await redis.MULTI()
    .INCR(key)
    .EXPIRE(key, 60)
    .EXEC();
  console.log(visits)
  await redis.disconnect();
  return visits > reqLimit;
}

module.exports = {
  limited
};