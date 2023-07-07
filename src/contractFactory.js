const { ethers } = require('ethers');
const fs = require('fs');
const https = require('https');
const contracts = JSON.parse(fs.readFileSync('contracts.json', { encoding: 'utf8' }));
const addressesJSONURL = 'https://raw.githubusercontent.com/the-standard/smart-vault/main/docs/addresses.json';

const getAddressOf = async (network, contractName) => {
  return new Promise(resolve => {
    https.get(addressesJSONURL, res => {
      let json = '';

      res.on('data', data => {
        json += data;
      });

      res.on('end', _ => {
        resolve(JSON.parse(json)[network][contractName]);
      });
    });
  });
};

const getContract = async (network, contractName, address) => {
  if (!address) {
    address = await getAddressOf(network, contractName);
  }
  return new ethers.Contract(address, contracts[contractName]);
};

module.exports = {
  getContract
};