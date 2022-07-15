const { network } = require("hardhat");
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config");
const {verify} = require("../utils/verify");


module.exports = async function ({ getNamedAccounts, deployments }) {
  console.log("Deploying NFT Marketplace");
  const args = [];
  const {deployer} = await getNamedAccounts();
  const {deploy} = deployments;

  const nftMarketplace = await deploy('NftMarketplace', {
    from: deployer,
    args: args,
    log: true,
  });

  if(!developmentChains.includes(network.name)){
    await verify(nftMarketplace.address, args)
  }
};

module.exports.tags = ["all","main"];