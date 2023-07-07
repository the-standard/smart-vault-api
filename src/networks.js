const getNetworks = _ => {
  return [
    {
      name: 'sepolia',
      rpc: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
    },
    {
      name: 'arbitrum_goerli',
      rpc: 'https://goerli-rollup.arbitrum.io/rpc'
    }
  ]
}

module.exports = {
  getNetworks
}