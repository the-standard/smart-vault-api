const { ethers } = require("ethers");
const Pool = require('pg-pool')
const { redisClient } = require("./redis");

const { 
  POSTGRES_HOST, POSTGRES_PORT, POSTGRES_STANDARD_DB, POSTGRES_USERNAME, POSTGRES_PASSWORD
} = process.env;

let pool = new Pool({
  database: POSTGRES_STANDARD_DB,
  user: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  host: POSTGRES_HOST,
  port: POSTGRES_PORT
});

const managerABI = [
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "vaultData",
    "inputs": [
      {
        "name": "_tokenID",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct SmartVaultManagerV6.SmartVaultData",
        "components": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "collateralRate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "mintFeeRate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "burnFeeRate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "tuple",
            "internalType": "struct ISmartVault.Status",
            "components": [
              {
                "name": "vaultAddress",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "minted",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "maxMintable",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "totalCollateralValue",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "collateral",
                "type": "tuple[]",
                "internalType": "struct ISmartVault.Asset[]",
                "components": [
                  {
                    "name": "token",
                    "type": "tuple",
                    "internalType": "struct ITokenManager.Token",
                    "components": [
                      {
                        "name": "symbol",
                        "type": "bytes32",
                        "internalType": "bytes32"
                      },
                      {
                        "name": "addr",
                        "type": "address",
                        "internalType": "address"
                      },
                      {
                        "name": "dec",
                        "type": "uint8",
                        "internalType": "uint8"
                      },
                      {
                        "name": "clAddr",
                        "type": "address",
                        "internalType": "address"
                      },
                      {
                        "name": "clDec",
                        "type": "uint8",
                        "internalType": "uint8"
                      }
                    ]
                  },
                  {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                  },
                  {
                    "name": "collateralValue",
                    "type": "uint256",
                    "internalType": "uint256"
                  }
                ]
              },
              {
                "name": "liquidated",
                "type": "bool",
                "internalType": "bool"
              },
              {
                "name": "version",
                "type": "uint8",
                "internalType": "uint8"
              },
              {
                "name": "vaultType",
                "type": "bytes32",
                "internalType": "bytes32"
              }
            ]
          }
        ]
      }
    ],
    "stateMutability": "view"
  }
];

const getRedemptionData = async _ => {
  return await redisClient.HGETALL('redemption');
};

const vaultRedemptionsAddress = url => {
  const split = url.split('/');
  return split.length === 3 && split[1] === 'redemptions' && split[2];
}

const getVaultRedemptionData = async url => {
  return [];
  // const vaultAddress = vaultRedemptionsAddress(url);
  // let result = []
  // const client = await pool.connect();
  // try {
  //   const query = 'SELECT collateral_token AS collateral, TRUNC(EXTRACT(EPOCH FROM redeemed_at)) AS ts, usds_redeemed AS debtRepaid, collateral_sold AS amount, collateral_sold_usd AS amountUSD FROM redemptions WHERE LOWER(vault_address) = LOWER($1);';
  //   result = (await client.query(query, [vaultAddress])).rows;
  // } finally {
  //   client.release();
  // }
  // return result;
}

const getRedemptionMultiData = async _ => {
  return [
    {"tokenID":"7","collateral":"0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f","hypervisor":"0x0000000000000000000000000000000000000000"},
    {"tokenID":"50","collateral":"0x0000000000000000000000000000000000000000","hypervisor":"0x52ee1FFBA696c5E9b0Bc177A9f8a3098420EA691"},
    {"tokenID":"97","collateral":"0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f","hypervisor":"0x52ee1FFBA696c5E9b0Bc177A9f8a3098420EA691"}
  ]
}

module.exports = {
  getRedemptionData,
  vaultRedemptionsAddress,
  getVaultRedemptionData,
  getRedemptionMultiData
};