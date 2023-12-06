const Pool = require('pg-pool')
const { 
  POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USERNAME, POSTGRES_PASSWORD
} = process.env;

let pool = new Pool({
  database: POSTGRES_DB,
  user: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  max: 20, // set pool max size to 20
  idleTimeoutMillis: 1000, // close idle clients after 1 second
  connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
  maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
});

const liquidationPoolsAddress = url => {
  const regex = /^\/liquidation_pools\/(?<address>0x[\w\d]*)(\?(?<queryParams>.*))?.*$/;
  return url.match(regex) && url.match(regex).groups;
}

const getDBData = async userAddress => {
  let result = [];
  const client = await pool.connect();
  try {
    result = (await client.query('SELECT snapshot_at, tst, euros, rewards FROM user_pool_snapshots_sepolia where user_address = $1', [userAddress])).rows;
  } finally {
    client.release();
  }
  return result;
}

const formatRewards = data => {
  return data.map(snapshot => {
    snapshot.rewards = snapshot.rewards.map(reward => {
      return {
        symbol: reward[0],
        amount: reward[1]
      };
    });
    return snapshot;
  });
}

const getLiquidationPoolData = async url => {
  const userAddress = liquidationPoolsAddress(url).address.toLowerCase();
  return formatRewards(await getDBData(userAddress));
};

module.exports = {
  getLiquidationPoolData,
  liquidationPoolsAddress
};