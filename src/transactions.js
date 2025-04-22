const https = require('https')
const { redisClient } = require('./redis');
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
  collateralDeposited: 'token from amount'
}

const fetchVaultActivityData = async (address, detailID, parameters) => {
  const query = parameters && parameters.detailType && detailID ?
    `query { ${parameters.detailType}(id: "${detailID}") { id ${fields[parameters.detailType]} } }` :
    `query { smartVaultActivities(where: { vault: "${address.toLowerCase()}" }) { id vault{id} user detailType blockTimestamp transactionHash minted totalCollateralValue } }`;
  const dataString = JSON.stringify({ query });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length,
    },
    timeout: 2000
  }

  return new Promise((resolve, reject) => {
    const req = https.request('https://api.studio.thegraph.com/query/109184/smart-vault-history/v0.0.10', options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`))
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        const resString = Buffer.concat(body).toString()
        resolve(resString)
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
  const parameters = parsedQueryParamsWithDefaults(queryParams);
  const data = await fetchVaultActivityData(address, detailID, parameters);
  return JSON.parse(data).data;
}

module.exports = {
  getTransactions,
  vaultTransactionsAddress
};