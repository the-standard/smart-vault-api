const schedule = require('node-schedule');
const { getContract } = require("./contractFactory");
const { ethers } = require('ethers');
const { getNetwork } = require('./networks');

const scheduleLiquidation = async _ => {
  const network = getNetwork('arbitrum');
  schedule.scheduleJob('* * * * *', async _ => {
    try {
      const provider = new ethers.getDefaultProvider(network.rpc)
      const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
      await (await getContract(network.name, 'SmartVaultManager')).connect(wallet).liquidateVaults()
      console.log(network.name, 'vault-liquidated');
    } catch(e) {
      console.log(network.name, e.reason)
    }
  });
}

module.exports = {
  scheduleLiquidation
}