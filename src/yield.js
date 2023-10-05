const { createClient } = require('redis');
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';
const GRAIL_ADDRESS = '0x3d9907f9a368ad0a51be60f7da3b97cf940982d8';
const TST_ADDRESS = '0xf5A27E55C748bCDdBfeA5477CB9Ae924f0f7fd2e';

const redis = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redis.on('error', err => console.log('Redis Client Error', err));

const getYieldData = async _ => {
  await redis.connect();
  const grailData = (await redis.get(`yield:${GRAIL_ADDRESS}`)).split(':');
  const tstData = (await redis.get(`yield:${TST_ADDRESS}`)).split(':');
  await redis.disconnect();
  if (grailData.length >= 3 && tstData.length >= 3) {
    return [
      {
        contractAddress: GRAIL_ADDRESS,
        name: 'GRAIL',
        updatedAt: grailData[0],
        opportunities: [
          {
            tvl: grailData[1],
            apy: grailData[2],
            link: 'https://app.thestandard.io/yield'
          }
        ]
      },
      {
        contractAddress: TST_ADDRESS,
        name: 'TST',
        updatedAt: tstData[0],
        opportunities: [
          {
            tvl: tstData[1],
            apy: tstData[2],
            link: 'https://app.thestandard.io/yield'
          }
        ]
      }
    ]
  }
}

module.exports = {
  getYieldData
}