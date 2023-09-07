const schedule = require('node-schedule');
const ethers = require('ethers');
const { createClient } = require('redis');
const { getContract, getERC20 } = require('./contractFactory');
const { getNetwork } = require('./networks');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';

const redis = createClient({
  url: `redis://${redisHost}:${redisPort}`
});
redis.on('error', err => console.log('Redis Client Error', err));


const indexStats = async _ => {
  await redis.connect();

  const network = getNetwork('arbitrum');
  const provider = new ethers.getDefaultProvider(network.rpc)
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  const tokens = await (await getContract(network.name, 'TokenManager')).connect(wallet).getAcceptedTokens();
  const eventData = await (await getContract(network.name, 'SmartVaultManager')).connect(wallet)
    .queryFilter('*');
  const vaultAddresses = eventData.filter(e => e.args).map(e => e.args[0]);
  const tvl = [];
  for (let i = 0; i < tokens.length; i++) {
    const { addr } = tokens[i];
    let assetTvl = 0n;
    for (let j = 0; j < vaultAddresses.length; j++) {
      const vaultAddress = vaultAddresses[j];
      if (addr === ethers.ZeroAddress) {
        assetTvl += await provider.getBalance(vaultAddress);
      } else {
        assetTvl += await (await getERC20(addr)).connect(wallet).balanceOf(vaultAddress);
      }
    }
    tvl.push({address: addr, assetTvl: assetTvl.toString()});
  }

  let multi = redis.MULTI()
          .DEL('assets')
          .SADD('assets', tvl.map(asset => asset.address));
  
  tvl.forEach(asset => {
    multi = multi.SETEX(`tvl:${asset.address}`, 3600, asset.assetTvl);
  });

  await multi.EXEC();
}

const scheduleStatIndexing = async _ => {
  schedule.scheduleJob(`*/10 * * * *`, async _ => {
    await indexStats();
  });
}

const getStats = async _ => {
  await redis.connect();
  const assets = await redis.SMEMBERS('assets');
  const tvl = [];
  for (let i = 0; i < assets.length; i++) {
    tvl.push({address: assets[i], amount: await redis.GET(`tvl:${assets[i]}`)});
  }
  return {tvl}
}

module.exports = {
  getStats,
  scheduleStatIndexing
}