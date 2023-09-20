const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';

const redis = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redis.on('error', err => console.log('Redis Client Error', err));

const getTransactions = async address => {
  // SCHEMA:
  // key: 'vaultTxs:0x...'
  // score: timestamp
  // value: 'type:hash:blockNo:asset:amount:amountDec:minted:collateralValue'
  // e.g. 'deposit:0x8ae26a528861d3e6c08d4331885eaba2d1b5b55fc540234fc9b8c9c198a0d429:124132949:PAXG:8000000000000000:18:136175000000000000000:181087962079756018667'
  const schema = ['type','txHash','blockNo','asset','amount','assetDec','minted','totalCollateralValue'];

  const start = 0;
  const end = -1;
  await redis.connect();
  const transactionData = await redis.ZRANGE_WITHSCORES(`vaultTxs:${address.toLowerCase()}`, start, end, {REV: true});
  await redis.disconnect();
  return transactionData.map(data => {
    const labelledData = {
      timestamp: data.score
    };
    return data.value.split(':').reduce((obj, item, i) => {
      return {
        ... obj,
        [schema[i]]: item
      }
    }, labelledData);
  });
};

module.exports = {
  getTransactions
};