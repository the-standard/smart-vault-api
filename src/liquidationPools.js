const Pool = require('pg-pool')
const { 
  POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USERNAME, POSTGRES_PASSWORD
} = process.env;

let pool = new Pool({
  database: POSTGRES_DB,
  user: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  host: POSTGRES_HOST,
  port: POSTGRES_PORT
});

const liquidationPoolsAddress = url => {
  const regex = /^\/liquidation_pools\/(?<address>0x[\w\d]*)(\?(?<queryParams>.*))?.*$/;
  return url.match(regex) && url.match(regex).groups;
}

const getDBData = async userAddress => {
  let result = [];
  const client = await pool.connect();
  try {
    const query = 'SELECT snapshot_at, assets FROM user_pool_snapshots where user_address = $1 ORDER BY snapshot_at ASC';
    result = (await client.query(query, [userAddress])).rows;
  } finally {
    client.release();
  }
  return result;
}

const getLiquidationPoolData = async url => {
  const userAddress = liquidationPoolsAddress(url).address.toLowerCase();
  return await getDBData(userAddress);
};

module.exports = {
  getLiquidationPoolData,
  liquidationPoolsAddress
};