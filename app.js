const http = require('http');
require('dotenv').config();
const { getPrices } = require('./src/pricing');
const { getStats } = require('./src/stats');
const { getNimbusData } = require('./src/nimbus.js');
console.log(process.env.REDIS_HOST)
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
  } else if (req.url === '/nimbus') {
    res.end(JSON.stringify(await getNimbusData()));
  }
  res.end();
});

server.listen(port);
console.log(`Simple Price Feed API server listening on ${port}`)