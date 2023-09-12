const http = require('http');
require('dotenv').config();
const { getPrices } = require('./src/pricing');
const { getStats } = require('./src/stats');
const { getYieldData } = require('./src/yield.js');
const port = process.env.PORT || 3000;

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
  }
  res.end();
});

server.listen(port);
console.log(`Simple Price Feed API server listening on ${port}`)