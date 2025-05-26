const https = require('https')
const Pool = require('pg-pool')
const { redisClient } = require("./redis");
const { getDefaultProvider, Contract, BigNumber } = require('ethers');
const JSBI = require('jsbi');
const { formatEther, parseUnits, formatUnits } = require('ethers/lib/utils');
const { getNetwork } = require('./networks');
const { TickMath, LiquidityMath } = require('@uniswap/v3-sdk');

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

const poolAbi = [
  {
    "inputs": [],
    "name": "slot0",
    "outputs": [
      {
        "internalType": "uint160",
        "name": "sqrtPriceX96",
        "type": "uint160"
      },
      {
        "internalType": "int24",
        "name": "tick",
        "type": "int24"
      },
      {
        "internalType": "uint16",
        "name": "observationIndex",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "observationCardinality",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "observationCardinalityNext",
        "type": "uint16"
      },
      {
        "internalType": "uint8",
        "name": "feeProtocol",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "unlocked",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "liquidity",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tickSpacing",
    "outputs": [
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      }
    ],
    "name": "ticks",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liquidityGross",
        "type": "uint128"
      },
      {
        "internalType": "int128",
        "name": "liquidityNet",
        "type": "int128"
      },
      {
        "internalType": "uint256",
        "name": "feeGrowthOutside0X128",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "feeGrowthOutside1X128",
        "type": "uint256"
      },
      {
        "internalType": "int56",
        "name": "tickCumulativeOutside",
        "type": "int56"
      },
      {
        "internalType": "uint160",
        "name": "secondsPerLiquidityOutsideX128",
        "type": "uint160"
      },
      {
        "internalType": "uint32",
        "name": "secondsOutside",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "initialized",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const get = async url => {
  return new Promise(resolve => {
    https.get(url, res => {
      let json = '';

      res.on('data', data => {
        json += data;
      });

      res.on('end', _ => {
        resolve(JSON.parse(json));
      });
    });
  });
}

const getRedemptionData = async _ => {
  return JSON.parse(await redisClient.LINDEX('redemptions', 0));
};

const vaultRedemptionsAddress = url => {
  const split = url.split('/');
  return split.length === 3 && split[1] === 'redemptions' && split[2];
}

const getVaultRedemptionData = async url => {
  const vaultAddress = vaultRedemptionsAddress(url);
  let result = []
  const client = await pool.connect();
  try {
    const query = 'SELECT collateral_token AS collateral, TRUNC(EXTRACT(EPOCH FROM redeemed_at)) AS ts, usds_redeemed AS "debtRepaid", collateral_sold AS amount, collateral_sold_usd AS "amountUSD" FROM redemptions WHERE LOWER(vault_address) = LOWER($1);';
    result = (await client.query(query, [vaultAddress])).rows;
  } finally {
    client.release();
  }
  return result;
}

const getPoolData = async _ => {
  let usds = JSBI.BigInt(0);
  const triggerPrice = JSBI.BigInt('78831026366734648999936');
  const pool = new Contract('0x8DEF4Db6697F4885bA4a3f75e9AdB3cEFCca6D6E', poolAbi, new getDefaultProvider(getNetwork('arbitrum').rpc));

  const [slot0, liquidity, tickSpacing] = await Promise.all([
    pool.slot0(),
    pool.liquidity(),
    pool.tickSpacing(),
  ]);

  const { tick, sqrtPriceX96 } = slot0;
  let lowerTick = Math.floor(tick / 60) * 60;
  let upperSqrt = JSBI.BigInt(sqrtPriceX96);
  let lowerSqrt = TickMath.getSqrtRatioAtTick(lowerTick);
  let currentLiquidity = JSBI.BigInt(liquidity.toString())
  while(JSBI.greaterThan(upperSqrt, triggerPrice)) {
    const numerator = JSBI.leftShift(JSBI.multiply(currentLiquidity, JSBI.subtract(upperSqrt, lowerSqrt)), JSBI.BigInt(96));
    const denominator = JSBI.multiply(upperSqrt, lowerSqrt);
    usds = JSBI.add(usds, JSBI.divide(numerator, denominator));
    upperSqrt = TickMath.getSqrtRatioAtTick(lowerTick);
    lowerTick -= tickSpacing;
    lowerSqrt = TickMath.getSqrtRatioAtTick(lowerTick);
    if (JSBI.greaterThan(triggerPrice, lowerSqrt)) lowerSqrt = triggerPrice;
    const { liquidityNet } = await pool.ticks(lowerTick);
    currentLiquidity = LiquidityMath.addDelta(currentLiquidity, JSBI.BigInt(liquidityNet.toString()))
  }
  // scale up by 6 decimals of accuracy (+ 12 decimals because of decimal difference in token pair)
  const scaledUpDecPrice = BigNumber.from(10).pow(18).mul(sqrtPriceX96.pow(2)).div(BigNumber.from(2).pow(192));
  return { usdsRemainingToTriggerPrice: formatEther(usds.toString()), usdsUsdcPrice: formatUnits(scaledUpDecPrice, 6) };
}

const getRedemptionsCandidates = async _ => {
  const { usdsRemainingToTriggerPrice, usdsUsdcPrice } = await getPoolData()
  return {
    vaults: (await redisClient.LRANGE('redemptions', 0, -1)).map(candidate => JSON.parse(candidate)),
    usdsUsdcPrice,
    usdsRemainingToTriggerPrice
  };
}

module.exports = {
  getRedemptionData,
  vaultRedemptionsAddress,
  getVaultRedemptionData,
  getRedemptionsCandidates
};