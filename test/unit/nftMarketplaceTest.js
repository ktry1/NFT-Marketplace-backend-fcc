const { expect } = require("chai");
const { deployments, ethers } = require("hardhat");
let contract, mock, signer, provider;
const PRICE = ethers.utils.parseEther("0.01");

describe("NFT Marketplace", function () {
    beforeEach(async()=>{
        await deployments.fixture(["all"]);
        provider = ethers.getDefaultProvider(network.config.url);
        signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        contract = await ethers.getContract("NftMarketplace", signer);
        mock = await ethers.getContract("BasicNft",signer);
        await mock.mintNft();
    await mock.approve(contract.address, 0);
   await contract.listItem(mock.address, 0, PRICE);
    })
    describe("Function tests", function () {
  
    it("correctly lists item", async function () {
    
   const item = await contract.getListing(mock.address,0);
   console.log(`Item seller is: ${item.seller}`);
   expect(item.seller).to.be.equal(signer.address);
   expect(item.price.toString()).to.be.equal(PRICE.toString());
  });
  
  it("Item is removed from listing after buying", async function () {
   
   await contract.buyItem(mock.address, 0 , {value: PRICE});
   await expect(contract.getListing(mock.address,0)).to.be.revertedWith("NftMarketplace__NotListed");
  });

  it("Removes the item on cancel function call", async function () {
   
   await contract.cancelListing(mock.address,0);
   await expect(contract.getListing(mock.address,0)).to.be.revertedWith("NftMarketplace__NotListed");
  });

  it("Updates price on updateListing function call", async function () {
    
    await contract.updateListing(mock.address,0,500);
    const item = await contract.getListing(mock.address,0);
    expect(item.price.toString()).to.be.equal("500");
  })
  
  it("Increases seller's proceeds after the listed item is bought", async function () {
    await contract.buyItem(mock.address, 0 , {value: PRICE});
    const proceeds = await contract.getProceeds(signer.address);
    expect(proceeds.toString()).to.be.equal(PRICE.toString());
  });
  
  it("Resets proceeds to 0 after withdrawal", async function () {
    await contract.buyItem(mock.address, 0 , {value: PRICE});
    const proceeds = await contract.getProceeds(signer.address);
    console.log(`Proceeds are ${proceeds.toString()}`);
    await contract.withdrawProceeds();
    const updatedProceeds = await contract.getProceeds(signer.address);
    expect(updatedProceeds.toString()).to.be.equal("0");
  });
});


  describe("Reverts Tests", function () {

  describe("NftMarketplace__NoProceeds", function () {
  it("Reverts if proceeds are equal to 0 and withdraw function is called", async function () {
  await expect(contract.withdrawProceeds()).to.be.revertedWith("NftMarketplace__NoProceeds");
  });
});

  describe("NftMarketplace__NotListed", function () {
  it("Reverts if the user tries to buy an unlisted item", async function () {
    await expect(contract.buyItem(mock.address,1,{value:PRICE})).to.be.revertedWith("NftMarketplace__NotListed");
  });

  it("Reverts if the user tries to update listing of unlisted item, async function",async function () {
    await expect(contract.updateListing(mock.address,1,500)).to.be.reverted;
  });

  describe("NftMarketplace__NotListed", function () {
  
    it("Reverts if the user tries to cancel an unlisted item", async function () {
    await expect(contract.cancelListing(mock.address,1)).to.be.reverted;
  });

});


describe("NftMarketplace__PriceNotMet", function () {
  it("Reverts if the user tries to buy an item lower then it's price", async function () {
    await expect(contract.buyItem(mock.address,0,{value:500})).to.be.revertedWith("NftMarketplace__PriceNotMet");
  });
});

  describe("NftMarketplace__AlreadyListed", function () {
  it("Reverts if the user tries to list the same item twice", async function () {
    await expect(contract.listItem(mock.address,0,PRICE)).to.be.revertedWith("NftMarketplace__AlreadyListed");
  });

  
});

});
});

describe("NftMarketplace__NotOwner", function () {
    
    it("Reverts if the user tries to list an item which does not belong to them", async function () {
        
        const imposter = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
        const imposterContract = await ethers.getContract("NftMarketplace", imposter);
        await mock.mintNft();
        await mock.approve(contract.address, 1);
        await expect(imposterContract.listItem(mock.address, 1, PRICE)).to.be.reverted;
    });
    
    it("Reverts if the user tries to update listing that does not belong to them", async function () {
        const imposter = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
        const imposterContract = await ethers.getContract("NftMarketplace", imposter);
        await expect(imposterContract.updateListing(mock.address, 0, 500)).to.be.reverted;
    });

    it("Reverts if the user tries to cancel listing that does not belong to them", async function () {
        const imposter = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
        const imposterContract = await ethers.getContract("NftMarketplace", imposter);
        await expect(imposterContract.cancelListing(mock.address, 0)).to.be.revertedWith("NftMarketplace__NotOWner");
    });

});

describe("Events tests", function () {
  
  it("Emits ItemListed when the item is listed", async function () {
    await mock.mintNft();
    await mock.approve(contract.address, 1);
    expect( await contract.listItem(mock.address, 1, PRICE)).to.emit("ItemListed");
  }); 

  it("Emits ItemBought when the item is bought", async function () {
     expect( await contract.buyItem(mock.address, 0 , {value: PRICE})).to.emit("ItemBought");
  });

  it("Emits ItemCancelled when the listing is cancelled", async function () {
     expect(await contract.cancelListing(mock.address,0)).to.emit("ItemCancelled");
  });
});
});