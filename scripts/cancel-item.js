const { ethers, network } = require("hardhat");
const {moveBlocks} = require("../utils/move-block");


async function cancelItem(nftAddress, tokenId){
    console.log(`Cancelling item with address: ${nftAddress} and tokenId: ${tokenId}...`);
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const tx = await nftMarketplace.cancelListing(nftAddress,tokenId);
    await tx.wait(1);
    console.log("Item cancelled!");
    if(network.config.chainId =="31337"){
        await moveBlocks(6, sleepAmount = 1000);
    } 
}

cancelItem("0x5FbDB2315678afecb367f032d93F642f64180aa3", 0)
.then(()=> process.exit(0))
.catch((error)=>{
    console.log(error);
    process.exit(1);
});