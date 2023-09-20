const http = require('http');
require('dotenv').config();
const { getPrices } = require('./src/pricing');
const { getStats } = require('./src/stats');
const { getYieldData } = require('./src/yield.js');
const { getTransactions } = require('./src/transactions.js');
const port = process.env.PORT || 3000;

const vaultTransactionsAddress = url => {
  const regex = /^\/transactions\/(?<address>0x(\w|\d)*)$/;
  return url.match(regex) && url.match(regex).groups.address;
}

const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Access-Control-Max-Age': 2592000,
    'Content-Type': 'application/json'
  };
  res.writeHead(200, headers);
  if (req.url === '/asset_prices') {
    res.end(JSON.stringify(await getPrices()));
  } else if (req.url === '/stats') {
    res.end(JSON.stringify(await getStats()));
  } else if (req.url === '/yield') {
    res.end(JSON.stringify(await getYieldData()));
  } else if (vaultTransactionsAddress(req.url)) {
    const vaultAddress = vaultTransactionsAddress(req.url);
    res.end(JSON.stringify(await getTransactions(vaultAddress)));
  }
  res.end();
});

server.listen(port);
console.log(`Simple Price Feed API server listening on ${port}`)