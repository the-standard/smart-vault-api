const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';

const redis = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redis.on('error', err => console.log('Redis Client Error', err));

const vaultTransactionsAddress = url => {
  const regex = /^\/transactions\/(?<address>0x[\w\d]*)(\?(?<queryParams>.*))?.*$/;
  return url.match(regex) && url.match(regex).groups;
}

const getTransactionsKey = address => {
  return `vaultTxs:${address.toLowerCase()}`;
}

const parsedQueryParamsWithDefaults = queryParams => {
  let params = {}
  if (queryParams) {
    params = queryParams && queryParams.split('&').reduce((obj, param) => {
      const splitParam = param.split('=');
      return { ... obj, [splitParam[0]]: splitParam[1] }
    }, params);
  }

  params.page = params.page && parseInt(params.page) ? 
    parseInt(params.page) : 1;
  params.limit = params.limit && parseInt(params.limit) <= 100 ?
    parseInt(params.limit) : 25;
  return params;
}

const getTransactions = async url => {
  // SCHEMA:
  // key: 'vaultTxs:0x...'
  // score: timestamp
  // value: 'type:hash:blockNo:asset:amount:amountDec:minted:collateralValue'
  // e.g. 'deposit:0x8ae26a528861d3e6c08d4331885eaba2d1b5b55fc540234fc9b8c9c198a0d429:124132949:PAXG:8000000000000000:18:136175000000000000000:181087962079756018667'
  const schema = ['type','txHash','blockNo','asset','amount','assetDec','minted','totalCollateralValue'];

  const {address, queryParams} = vaultTransactionsAddress(url);
  const { page, limit, sort } = parsedQueryParamsWithDefaults(queryParams);
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  const REV = !(sort === 'asc');
  await redis.connect();
  const transactionData = await redis.ZRANGE_WITHSCORES(getTransactionsKey(address), start, end, {REV});
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
  getTransactions,
  vaultTransactionsAddress
};