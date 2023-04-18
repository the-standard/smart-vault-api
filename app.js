const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const Web3 = require('web3');
const fs = require('fs');
require('dotenv').config();
const schedule = require('node-schedule');
const web3 = new Web3(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
const contracts = JSON.parse(fs.readFileSync('contracts.json', { encoding: 'utf8' }));
const tokenManagerContract = new web3.eth.Contract(contracts.tokenManager.abi, contracts.tokenManager.address);
const minsPerDay = 60 * 24;
const dataPoints = 48;
const intervalMins = minsPerDay / dataPoints;

let prices = {};

app.get('/', async (_, res) => {
  res.json(prices);
});

const addPriceToData = token => {
  const symbol = web3.utils.hexToUtf8(token.symbol);
  const chainlinkContract = new web3.eth.Contract(contracts.chainlink.abi, token.clAddr);
  chainlinkContract.methods.latestRoundData().call().then(data => {
    if (prices[symbol]) {
      prices[symbol].prices = [ ...prices[symbol].prices, data.answer ].splice(-dataPoints, dataPoints);
    } else {
      chainlinkContract.methods.decimals().call().then(dec => {
        prices[symbol] = {
          decimals: dec,
          prices: [data.answer]
        }
      });
    }
  });
}

schedule.scheduleJob(`*/${intervalMins} * * * *`, _ => {
  tokenManagerContract.methods.getAcceptedTokens().call().then(tokens => {
    tokens.map(token => {
      addPriceToData(token);
    });
  });
});

app.listen(port, () => {
  console.log(`Simple Price Feed app listening on port ${port}`);
});