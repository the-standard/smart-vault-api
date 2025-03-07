const { ethers } = require("ethers");
const Pool = require('pg-pool')
const { redisClient } = require("./redis");

const getAtRiskVaults = async _ => {
  return (await redisClient.SMEMBERS('atRiskVaults'))
    .map(tokenID => {
      return { tokenID };
    })
}

module.exports = {
  getAtRiskVaults
};