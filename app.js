const port =   process.env.PORT || 3000;
const http = require('http');
require('dotenv').config();
const { scheduleLiquidation } = require('./src/liquidation');
const { getPrices, schedulePricing } = require('./src/pricing');

scheduleLiquidation();
schedulePricing();

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  if (req.url === '/_health') {
    res.statusCode = 200;
    res.end();
  } else {
    const headers = {
      'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
      'Access-Control-Allow-Methods': 'OPTIONS, GET',
      'Access-Control-Max-Age': 2592000, // 30 days
      'Content-Type': 'application/json'
      /** add other headers as per requirement */
    };
    res.writeHead(200, headers);
    res.end(JSON.stringify(getPrices()));
  }
});

server.listen(port);
console.log(`Simple Price Feed API server listening on ${port}`)