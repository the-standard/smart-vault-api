const port = 3000 || process.env.PORT;
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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getPrices()));
  }
});

server.listen(port);
console.log(`Simple Price Feed API server listening on ${port}`)