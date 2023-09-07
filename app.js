const http = require('http');
require('dotenv').config();
const { scheduleLiquidation } = require('./src/liquidation');
const { getPrices } = require('./src/pricing');
const { getStats, scheduleStatIndexing } = require('./src/stats');

const port = process.env.PORT || 3000;

scheduleLiquidation();
scheduleStatIndexing();

const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Access-Control-Max-Age': 2592000,
    'Content-Type': 'application/json'
  };
  if (req.url === '/asset_prices') {
    res.writeHead(200, headers);
    res.end(JSON.stringify(await getPrices()));
  } else if (req.url === '/stats') {
    res.writeHead(200, headers);
    res.end(JSON.stringify(await getStats()));
  }
  res.statusCode = 200;
  res.end();
});

server.listen(port);
console.log(`Simple Price Feed API server listening on ${port}`)