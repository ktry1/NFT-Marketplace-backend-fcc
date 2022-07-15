const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require('path');


const frontEndContractsFile = "../nft-marketplace-frontend/constants/networkMapping.json";
const frontEndContractsPath = path.resolve(frontEndContractsFile);
const frontEndAbiFile = "../nft-marketplace-frontend/constants/NftMarketplace.json";
const frontEndAbiLocation = path.resolve(frontEndAbiFile);
const NftFile = "../nft-marketplace-frontend/constants/BasicNft.json";
const NftLocation = path.resolve(NftFile);


module.exports = async function() {
    if(process.env.UPDATE_FRONT_END){
        console.log("Updating front end...");
        await updateContractAddresses();
        await updateAbi();
    }

    async function updateAbi(){
        const nftMarketplace = await ethers.getContract("NftMarketplace");
        const marketplaceAbi = nftMarketplace.interface.format(ethers.utils.FormatTypes.json);
        fs.writeFileSync(frontEndAbiLocation,marketplaceAbi);
        const basicNft = await ethers.getContract("BasicNft");
        const nftAbi = basicNft.interface.format(ethers.utils.FormatTypes.json);
        fs.writeFileSync(NftLocation,nftAbi);
    }

    async function updateContractAddresses(){
        const provider = ethers.getDefaultProvider(network.config.url);
        const nftMarketplace = await ethers.getContract("NftMarketplace",provider);
        const chainId = network.config.chainId.toString();
        const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsPath,"utf8"));
        if (chainId in contractAddresses){
            if(!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)){
                contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address);
            }
            else {
                contractAddresses[chainId] = {"NftMarketplace":[nftMarketplace.address]};
            }
        }
        fs.writeFileSync(frontEndContractsPath, JSON.stringify(contractAddresses));
    }
}

module.exports.tags = ["all","frontEnd"];