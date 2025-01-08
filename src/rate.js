const { getReadyRedis } = require('./redis');

const limited = async ip => {
  const key = `rateLimit:${ip}`
  const reqLimit = 100;
  const redis = await getReadyRedis();
  const visits = await redis.INCR(key);
  if (visits === 1) await redis.EXPIRE(key, 60);
  await redis.disconnect();
  return visits > reqLimit;
}

module.exports = {
  limited
};