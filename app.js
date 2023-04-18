const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const Web3 = require('web3');
const fs = require('fs');
require('dotenv').config();
const schedule = require('node-schedule');
const networkName = process.env.NETWORK_NAME || 'mainnet';
const web3 = new Web3(`https://${networkName}.infura.io/v3/${process.env.INFURA_API_KEY}`);
const contracts = JSON.parse(fs.readFileSync('contracts.json', { encoding: 'utf8' }));
const tokenManagerContract = new web3.eth.Contract(contracts.tokenManager, process.env.TOKEN_MANAGER_ADDRESS);

let prices = {};

app.get('/', async (_, res) => {
  res.json(prices);
});

const addPriceToData = (token, ts) => {
  const symbol = web3.utils.hexToUtf8(token.symbol);
  const chainlinkContract = new web3.eth.Contract(contracts.chainlink, token.clAddr);
  chainlinkContract.methods.latestRoundData().call().then(data => {
    if (prices[symbol]) {
      prices[symbol].prices = [ 
        ...prices[symbol].prices, {
          price: data.answer,
          ts: ts
        }
      ].splice(-48, 48);
    } else {
      chainlinkContract.methods.decimals().call().then(dec => {
        prices[symbol] = {
          decimals: dec,
          prices: [{
            price: data.answer, 
            ts: ts
          }]
        }
      });
    }
  });
}

schedule.scheduleJob(`0,30 * * * *`, _ => {
  const ts = Math.floor(new Date() / 1000);
  tokenManagerContract.methods.getAcceptedTokens().call().then(tokens => {
    tokens.map(token => {
      addPriceToData(token, ts);
    });
  });
});

app.listen(port, () => {
  console.log(`Simple Price Feed app listening on port ${port}`);
});