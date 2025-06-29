const https = require('https')
const { parseQueryParams } = require('./utils')

const vaultTransactionsAddress = url => {
  const regex = /^\/transactions\/(?<address>0x[\w\d]*)(\/?(?<detailID>0x[\w\d\-]*))?(\?(?<queryParams>.*))?.*$/;
  return url.match(regex) && url.match(regex).groups;
}
  
const parsedQueryParamsWithDefaults = queryParams => {
  const params = parseQueryParams(queryParams);

  params.page = params.page && parseInt(params.page) ? 
    parseInt(params.page) : 1;
  params.limit = params.limit && parseInt(params.limit) <= 100 ?
    parseInt(params.limit) : 25;
  return params;
}

const fields = {
  usdsMinted: 'to amount fee',
  usdsBurned: 'amount fee',
  collateralRemoved: 'symbol to amount',
  assetRemoved: 'token to amount',
  collateralDeposited: 'token from amount',
  vaultDeployed: 'vaultAddress owner tokenId',
  vaultLiquidated: '',
  swap: 'tokenIn tokenOut amountIn feeRate',
  depositYield: 'tokenIn stablePercentage',
  withdrawYield: 'hypervisor tokenOut',
  autoRedemption: 'token hypervisor USDsRedeemed'
}

const post = async query => {
  const dataString = JSON.stringify({ query });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length,
      'Authorization': `Bearer ${process.env.THE_GRAPH_API_KEY}`
    },
    timeout: 2000
  }

  return new Promise((resolve, reject) => {
    const req = https.request('https://gateway.thegraph.com/api/subgraphs/id/HigybHbmBZkBtXo7mJdiks3wAkRrpfXQx3t4mYuR5rR6', options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`))
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        const resString = Buffer.concat(body).toString()
        resolve(JSON.parse(resString))
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request time out'))
    })

    req.write(dataString)
    req.end()
  })
}

const getTransactions = async url => {
  const { address, detailID, queryParams } = vaultTransactionsAddress(url);
  const { detailType, page, limit } = parsedQueryParamsWithDefaults(queryParams);
  if (detailType) {
    const query = `query { ${detailType}(id: "${detailID}") { id ${fields[detailType]} } }`;
    return (await post(query)).data;
  } else {
    const query = `query { smartVaultActivities(where: { vault: "${address.toLowerCase()}" } orderBy: blockTimestamp orderDirection: desc first: ${limit} skip: ${(page - 1) * limit}) {id vault{id} user detailType blockTimestamp blockNumber transactionHash minted totalCollateralValue} smartVault(id: "${address.toLowerCase()}") { activityCount } }`;
    const { data } = await post(query);
    if (data) {
      data.pagination = {
        currentPage: page,
        limit: limit,
        totalRows: (data.smartVault && data.smartVault.activityCount) || 0
      }
      delete data.smartVault;
    }
    return data;
  }
}

module.exports = {
  getTransactions,
  vaultTransactionsAddress
};