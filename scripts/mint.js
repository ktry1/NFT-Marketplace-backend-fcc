const { ethers, network } = require("hardhat");
const {moveBlocks} = require("../utils/move-block");


async function mint(){
    const basicNft = await ethers.getContract("BasicNft");
    console.log("Minting NFT...");
    const mintTx = await basicNft.mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId;
    console.log(`Got Token Id: ${tokenId}`);
    

    if(network.config.chainId =="31337"){
        await moveBlocks(6, sleepAmount = 1000);
    } 
}

mint()
.then(()=> process.exit(0))
.catch((error)=>{
    console.log(error);
    process.exit(1);
});