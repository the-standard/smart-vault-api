const schedule = require('node-schedule');
const { getContract } = require("./contractFactory");
const { ethers } = require('ethers');

const rpcs = {
  sepolia: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
  arbitrum_goerli: 'https://goerli-rollup.arbitrum.io/rpc'
}

const scheduleLiquidation = async _ => {
  const networks = ['sepolia', 'arbitrum_goerli']
  networks.forEach(async network => {
    schedule.scheduleJob('*/5 * * * *', async _ => {
      try {
        const provider = new ethers.getDefaultProvider(rpcs[network])
        const wallet = new ethers.Wallet(process.env.WALLET_KEY, provider);
        await (await getContract(network, 'SmartVaultManager')).connect(wallet).liquidateVaults()
        console.log(network, 'vault-liquidated');
      } catch(e) {
        console.log(network, e.reason)
      }
    });
  });
}

module.exports = {
  scheduleLiquidation
}