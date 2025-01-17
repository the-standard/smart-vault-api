const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';

const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redisClient.on('error', err => console.log('Redis Client Error', err));

async function main() {
  await redisClient.connect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = {
  redisClient
}