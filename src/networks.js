const networks = [
  {
    name: 'arbitrum',
    rpc: 'https://arb1.arbitrum.io/rpc'
  },
  {
    name: 'arbitrum_sepolia',
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc'
  },
  {
    name: 'ethereum',
    rpc: 'https://eth.llamarpc.com'
  }
]

const getNetworks = _ => {
  return networks;
}

const getNetwork = name => {
  return networks.filter(network => network.name === name)[0];
}

module.exports = {
  getNetworks,
  getNetwork
}