const { ethers } = require("ethers");
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
  return ethers.utils.defaultAbiCoder.encode(['uint256','address'],['29','0x82aF49447D8a07e3bd95BD0d56f35241523fBab1']);
};

module.exports = {
  getRedemptionData
};

