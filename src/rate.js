const { redisClient } = require("./redis");

const limited = async ip => {
  const key = `rateLimit:${ip}`
  const reqLimit = 100;
  const visits = await redisClient.INCR(key);
  if (visits === 1) await redisClient.EXPIRE(key, 60);
  return visits > reqLimit;
}

module.exports = {
  limited
};