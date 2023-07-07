const fs = require('fs');
const https = require('https');
const Web3 = require('web3');

const networkName = process.env.NETWORK_NAME || 'mainnet';
const contracts = JSON.parse(fs.readFileSync('contracts.json', { encoding: 'utf8' }));
const web3 = new Web3(`https://${networkName}.infura.io/v3/${process.env.INFURA_API_KEY}`);
const addressesJSONURL = 'https://raw.githubusercontent.com/the-standard/smart-vault/main/docs/addresses.json';

const getAddressOf = async (contractName) => {
  return new Promise(resolve => {
    https.get(addressesJSONURL, res => {
      let json = '';

      res.on('data', data => {
        json += data;
      });

      res.on('end', _ => {
        resolve(JSON.parse(json)[networkName][contractName]);
      });
    });
  });
};

const getContract = async (contractName, address) => {
  if (!address) {
    address = await getAddressOf(contractName);
  }
  return new web3.eth.Contract(contracts[contractName], address);
};

module.exports = {
  getContract
};