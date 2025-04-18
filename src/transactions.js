const { redisClient } = require('./redis');
const { parseQueryParams } = require('./utils')

const vaultTransactionsAddress = url => {
  const regex = /^\/transactions\/(?<address>0x[\w\d]*)(\?(?<queryParams>.*))?.*$/;
  return url.match(regex) && url.match(regex).groups;
}

const getTransactionsKey = address => {
  return `vaultTxs:${address.toLowerCase()}`;
}
  
const parsedQueryParamsWithDefaults = queryParams => {
  const params = parseQueryParams(queryParams);

  params.page = params.page && parseInt(params.page) ? 
    parseInt(params.page) : 1;
  params.limit = params.limit && parseInt(params.limit) <= 100 ?
    parseInt(params.limit) : 25;
  return params;
}

const formatTransactions = transactionData => {
  // SCHEMA:
  // key: 'vaultTxs:0x...'
  // score: timestamp
  // value: 'type:hash:blockNo:asset:amount:amountDec:minted:collateralValue'
  // e.g. 'deposit:0x8ae26a528861d3e6c08d4331885eaba2d1b5b55fc540234fc9b8c9c198a0d429:124132949:PAXG:8000000000000000:18:136175000000000000000:181087962079756018667'
  const schema = ['type','txHash','blockNo','asset','amount','assetDec','minted','totalCollateralValue'];

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
}

const getTransactions = async url => {
  const {address, queryParams} = vaultTransactionsAddress(url);
  const { page, limit, sort } = parsedQueryParamsWithDefaults(queryParams);
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  const REV = !(sort === 'asc');
  const key = getTransactionsKey(address)
  const transactionData = await redisClient.ZRANGE_WITHSCORES(key, start, end, {REV});
  const count = await redisClient.ZCARD(key);
  const transactions = formatTransactions(transactionData);
  return {
    data: transactions,
    pagination: {
      currentPage: page,
      totalRows: count,
      rowsPerPage: limit
    }
  }
};

module.exports = {
  getTransactions,
  vaultTransactionsAddress
};