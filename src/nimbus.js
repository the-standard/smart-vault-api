const getNimbusData = async _ => {
  return [
    {
      contractAddress: '0x3d9907f9a368ad0a51be60f7da3b97cf940982d8',
      name: 'GRAIL',
      updatedAt: 1694177638,
      opportunities: [
        {
          apy: 0.63,
          tvl: 145_968,
          link: 'https://app.thestandard.io/yield'
        }
      ]
    },
    {
      contractAddress: '0xf5A27E55C748bCDdBfeA5477CB9Ae924f0f7fd2e',
      name: 'TST',
      updatedAt: 1694177638,
      opportunities: [
        {
          apy: 5,
          tvl: 60_000,
          link: 'https://app.thestandard.io/yield'
        }
      ]
    }
  ]
}

module.exports = {
  getNimbusData
}