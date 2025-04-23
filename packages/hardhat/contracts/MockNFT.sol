pragma solidity 0.8.20; //Do not change the solidity version as it negatively impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    // Mapping to track which addresses have a valid key
    mapping(address => bool) private _validKeys;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Mint a new NFT
     * @param to The address to mint the NFT to
     */
    function mint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);

        // When minting, set the user to have a valid key
        _validKeys[to] = true;
    }

    /**
     * @dev Revoke a user's valid key status
     * @param user The address to revoke
     */
    function revokeKey(address user) public onlyOwner {
        _validKeys[user] = false;
    }

    /**
     * @dev Grant a user valid key status without minting
     * @param user The address to grant access
     */
    function grantKey(address user) public onlyOwner {
        _validKeys[user] = true;
    }

    /**
     * @dev Check if a user has a valid key (implements IPublicLock interface)
     * @param _user The address to check
     * @return True if the user has a valid key, false otherwise
     */
    function getHasValidKey(address _user) external view returns (bool) {
        return _validKeys[_user];
    }

    /**
     * @dev Get the token ID of the user's first token (implements IPublicLock interface)
     * @return The token ID
     */
    function tokenOfOwnerByIndex() external pure returns (uint256) { 
        // This is a simplified implementation - real implementation would need to track tokens per owner
        return 0;
    }

    /**
     * @dev Override _baseURI for token URI construction
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Update the base URI
     * @param newBaseURI The new base URI
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    // The following functions are overrides required by Solidity
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
