const ethers = require('ethers');

const getStats = _ => {
  return {
    tvl: [
      {address: ethers.ZeroAddress, amount: ethers.parseEther('0.1').toString()},
      {address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', amount: 1000000},
      {address: '0x912CE59144191C1204E64559FE8253a0e49E6548', amount: ethers.parseEther('100').toString()},
      {address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', amount: ethers.parseEther('100').toString()},
      {address: '0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429', amount: ethers.parseEther('100').toString()}
    ]
  }
}

module.exports = {
  getStats
}