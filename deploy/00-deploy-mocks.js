const { network } = require("hardhat");
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config");
const {verify} = require("../utils/verify");


module.exports = async function ({ getNamedAccounts, deployments }) {
    if(developmentChains.includes(network.name)){
    console.log("Detected Development network! Deploying mocks...");
  const args = [];
  const {deployer} = await getNamedAccounts();
  const {deploy} = deployments;
    
   
  await deploy('BasicNft', {
    from: deployer,
    args: args,
    log: true,
  });

   await deploy('NftMarketplace', {
    from: deployer,
    args: args,
    log: true,
  });
}
console.log("Mocks deployed!");
console.log("----------------------------------------");
};

module.exports.tags = ["all", "mocks"];