const { ethers, network } = require("hardhat");
const {moveBlocks} = require("../utils/move-block");
const PRICE = ethers.utils.parseEther("0.01");
const TOKEN_ID = 1;

async function buyItem(nftAddress, tokenId){
    console.log(`Buying item with address: ${nftAddress} and tokenId: ${tokenId}...`);
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const tx = await nftMarketplace.buyItem(nftAddress,tokenId, {value: PRICE});
    await tx.wait(1);
    console.log("Item bought!");
    if(network.config.chainId =="31337"){
        await moveBlocks(6, sleepAmount = 1000);
    } 
}

buyItem("0x5FbDB2315678afecb367f032d93F642f64180aa3", TOKEN_ID)
.then(()=> process.exit(0))
.catch((error)=>{
    console.log(error);
    process.exit(1);
});