const http = require('http');
require('dotenv').config();
const { limited } = require('./src/rate');
const { getPrices } = require('./src/pricing');
const { estimateSwap, estimateSwapUrl } = require('./src/swap.js');
const { getTransactions, vaultTransactionsAddress } = require('./src/transactions.js');
const { getLiquidationPoolData, liquidationPoolsAddress } = require('./src/liquidationPools.js');
const { getRedemptionData } = require('./src/redemptions.js');
const { supplyAddress, getSupplyData } = require('./src/supply.js');
const port = process.env.PORT || 3000;


const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Access-Control-Max-Age': 2592000,
    'Content-Type': 'application/json'
  };
  const ip = req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress;
  // if (ip && await limited(ip)) {
  //   res.writeHead(429, headers);
  // } else {
    res.writeHead(200, headers);
    if (req.url === '/asset_prices') {
      res.end(JSON.stringify(await getPrices()));
    } else if (estimateSwapUrl(req.url)) {
      res.end(JSON.stringify(await estimateSwap(req.url)))
    } else if (vaultTransactionsAddress(req.url)) {
      res.end(JSON.stringify(await getTransactions(req.url)));
    } else if (liquidationPoolsAddress(req.url)) {
      res.end(JSON.stringify(await getLiquidationPoolData(req.url)));
    } else if (req.url === '/redemption') {
      res.end(JSON.stringify(await getRedemptionData()))
    } else if (supplyAddress(req.url)) {
      res.end(JSON.stringify(await getSupplyData(req.url)))
    }
  // }

  res.end();
});

server.listen(port);
console.log(`Simple Price Feed API server listening on ${port}`)