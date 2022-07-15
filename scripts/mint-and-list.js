const { ethers, network } = require("hardhat");
const {moveBlocks} = require("../utils/move-block");
const PRICE = ethers.utils.parseEther("0.01");

async function mintAndList(){
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNft");
    console.log("Minting NFT...");
    const mintTx = await basicNft.mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId;
    console.log("Minting done! Approving NFT...");
    const approvalTx = await basicNft.approve(nftMarketplace.address,tokenId);
    await approvalTx.wait(1);
    console.log("NFT approved! Listing it...");
    const tx = await nftMarketplace.listItem(basicNft.address,tokenId,PRICE);
    await tx.wait(1);
    console.log("NFT listed!");

    if(network.config.chainId =="31337"){
        await moveBlocks(6, sleepAmount = 1000);
    } 
}

mintAndList()
.then(()=> process.exit(0))
.catch((error)=>{
    console.log(error);
    process.exit(1);
});