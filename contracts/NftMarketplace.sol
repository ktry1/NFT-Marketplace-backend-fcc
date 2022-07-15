// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error NftMarketplace__InvalidPrice();
error NftMarketplace__NotApproved();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOWner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

/// @title NFT Marketplace
/// @author Patrick Collins, student Kyrylo Troiak
/// @notice A contract for implementing an NFT marketplace
/// @dev All function calls are currently implemented without side effects
contract NftMarketplace {
    //State Variables
    struct Listing {
        uint256 price;
        address seller;
    }
    event ItemListed(address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 price);
    event ItemBought(address indexed buyer, address indexed nftAddress,uint256 indexed tokenId, uint256 price);
    event ItemCancelled(address indexed seller, address indexed nftAddress, uint indexed tokenId);
    
    /// @notice Mapping: NFT contract address =>NFT Token id => Listing 
    /// @dev This mapping is used for modifiers checks and keeping track of listed NFTs;
    
    mapping(address=> mapping(uint256=>Listing)) private s_listings;

    //Seller address => Amount earned
    mapping(address=>uint256) private s_proceeds;

    // Modifiers
   
    /// @notice Checks if the sender of the message is it's owner
    /// @dev modifier is called before notListed() modifier and function listItem()
    /// @param nftAddress The address of NFT contract to which this NFT belongs 
    /// @param tokenId Id of a token that the user wants to list
    /// @param sender signer sending a message
    modifier isOwner(address nftAddress, uint256 tokenId, address sender){
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if(sender != owner){
            revert NftMarketplace__NotOWner();
        }
        _;
    }

    /// @notice Checks if NFT with these params is not already listed
    /// @dev modifier is called after isOwner modifier before execution of listItem()
    /// @param nftAddress The address of NFT contract to which this NFT belongs 
    /// @param tokenId Id of a token that the user wants to list
    /// @param owner after passing the isOwner() modifier msg.sender is considered owner
    modifier notListed(address nftAddress, uint256 tokenId, address owner){
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price>0){
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier IsListed(address nftAddress, uint256 tokenId){
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (!(listing.price> 0)){
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    // Main functions
    /// @notice Lists NFT on the marketplace after passing checks
    /// @dev After modifier checks are passed, NFT is listed 
    /// @param  nftAddress The address of NFT contract to which this NFT belongs 
    /// @param  tokenId Id of a token that the user wants to list
    /// @param  price NFT will be listed with this price
    
    function listItem(address nftAddress, uint256 tokenId, uint256 price) external 
    notListed(nftAddress,tokenId,msg.sender) isOwner(nftAddress, tokenId, msg.sender){
        if (price<=0){
            revert NftMarketplace__InvalidPrice();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)){
          revert NftMarketplace__NotApproved();  
        }
        s_listings[nftAddress][tokenId] = Listing(price,msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price); 
    }

    function buyItem(address nftAddress, uint256 tokenId) external payable IsListed(nftAddress,tokenId) {
        Listing memory item = s_listings[nftAddress][tokenId];
        if(msg.value <item.price){
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, item.price);
        }
        s_proceeds[item.seller] += msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(item.seller, msg.sender, tokenId);
        // Check to make sure NFT was Transfered
        emit ItemBought(msg.sender, nftAddress, tokenId, item.price);
        // Allow to use altcoins!!!
    }

    function cancelListing(address nftAddress, uint256 tokenId) external isOwner(nftAddress,tokenId,msg.sender) IsListed(nftAddress,tokenId) {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(address nftAddress, uint256 tokenId, uint256 newPrice) external  isOwner(nftAddress,tokenId,msg.sender) IsListed(nftAddress,tokenId){
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender,nftAddress,tokenId,newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if(!(proceeds > 0)){
            revert NftMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success,) = payable(msg.sender).call{value:proceeds}("");
        if (!success){
            revert NftMarketplace__TransferFailed();
        }
    }

    //Getter functions 
    function getListing(address nftAddress, uint256 tokenId) external IsListed(nftAddress, tokenId) view returns(Listing memory)  {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns(uint256){
        return s_proceeds[seller];
    }
}