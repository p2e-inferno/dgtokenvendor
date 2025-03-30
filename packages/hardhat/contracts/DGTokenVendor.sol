pragma solidity 0.8.20; //Do not change the solidity version as it negatively impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Custom error definitions
error ExceedsMaxWhitelistedCollections();
error CollectionAddressNotFound();
error CollectionAlreadyAdded();
error NoValidKeyForUserFound();
error TokenTransferFailed();
error RateLockStillActive();
error FeeLockStillActive();
error InsufficientAllowance();
error ETHTransferFailed();
error InvalidFeeBPS();
error InvalidDevAddress();
error AppChangeCooldownStillActive();
error UnauthorizedCaller();

interface IPublicLock {
    function getHasValidKey(address _user) external view returns (bool);

    function tokenOfOwnerByIndex(address _user, uint256 _index) external view returns (uint256);
}

contract DGTokenVendor is Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant MAX_WHITELISTED_COLLECTIONS = 10;
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    uint256 public constant MAX_FEE_BPS = 1000; // Maximum fee of 10% (1000 basis points)
    uint256 public constant RATE_CHANGE_COOLDOWN = 90 days;
    uint256 public constant APP_CHANGE_COOLDOWN = 100 days;
    address public DEV_ADDRESS;
    uint64 public constant VERSION = 1;
    string public constant NAME = "DGTokenVendorV1";

    // Token addresses
    IERC20 public baseToken;
    IERC20 public swapToken;

    uint256 public lastDevAddressChangeTimestamp;

    // Exchange rate (how many swap tokens per base token)
    uint256 public exchangeRate;
    uint256 public lastRateChangeTimestamp;

    // Fee settings
    uint256 public buyFeeBPS; // Buy fee in basis points
    uint256 public sellFeeBPS; // Sell fee in basis points
    uint256 public lastFeeChangeTimestamp;

    // Array of whitelisted NFT collection addresses
    address[] private whitelistedCollections;

    // Fee tracking
    uint256 public baseTokenFees;
    uint256 public swapTokenFees;

    // Events
    event TokensPurchased(address indexed buyer, uint256 baseTokenAmount, uint256 swapTokenAmount, uint256 fee);
    event TokensSold(address indexed seller, uint256 swapTokenAmount, uint256 baseTokenAmount, uint256 fee);
    event WhitelistedCollectionAdded(address indexed collectionAddress);
    event WhitelistedCollectionRemoved(address indexed collectionAddress);
    event ExchangeRateUpdated(uint256 newRate);
    event FeesWithdrawn(address indexed to, uint256 baseTokenFees, uint256 swapTokenFees);
    event ETHWithdrawn(address indexed to, uint256 amount);
    event FeeRatesUpdated(uint256 newBuyFeeBPS, uint256 newSellFeeBPS);

    constructor(
        address _baseToken,
        address _swapToken,
        uint256 _initialExchangeRate,
        address _devAddress
    ) Ownable(msg.sender) {
        // Initialize Dapp state
        baseToken = IERC20(_baseToken);
        swapToken = IERC20(_swapToken);
        exchangeRate = _initialExchangeRate;
        lastRateChangeTimestamp = block.timestamp;
        buyFeeBPS = 100; // 1% initial buy fee
        sellFeeBPS = 200; // 2% initial sell fee
        lastFeeChangeTimestamp = block.timestamp;
        DEV_ADDRESS = _devAddress;
        lastDevAddressChangeTimestamp = block.timestamp;
    }

    modifier onlyNFTHolder() {
        if (!hasValidKey(msg.sender)) revert NoValidKeyForUserFound();
        _;
    }

    modifier onlyAuthorized() {
        if (!(msg.sender == owner() || msg.sender == DEV_ADDRESS)) revert UnauthorizedCaller();
        _;
    }

    /**
     * @dev Buy swap tokens using base tokens
     * @param amount Amount of base tokens to spend
     */
    function buyTokens(uint256 amount) external nonReentrant onlyNFTHolder {
        // Calculate fee using current buyFeeBPS
        uint256 fee = (amount * buyFeeBPS) / BASIS_POINTS;
        uint256 tokenToBuyAmountAfterFee = amount - fee;
        // Calculate swap tokens to receive
        uint256 tokenToBuyAmount = tokenToBuyAmountAfterFee * exchangeRate;

        // Update fee tracking
        baseTokenFees += fee;

        // Transfer base tokens from user to contract
        bool baseTransferSuccess = baseToken.transferFrom(msg.sender, address(this), amount);
        if (!baseTransferSuccess) revert TokenTransferFailed();

        // Transfer swap tokens to user
        bool swapTransferSuccess = swapToken.transfer(msg.sender, tokenToBuyAmount);
        if (!swapTransferSuccess) revert TokenTransferFailed();

        emit TokensPurchased(msg.sender, amount, tokenToBuyAmount, fee);
    }

    /**
     * @dev Sell swap tokens for base tokens
     * @param amount Amount of swap tokens to sell
     */
    function sellTokens(uint256 amount) external nonReentrant onlyNFTHolder {
        // Calculate fee using current sellFeeBPS
        uint256 fee = (amount * sellFeeBPS) / BASIS_POINTS;
        uint256 tokensAmountAfterFee = amount - fee;
        // Calculate base tokens to receive
        uint256 tokensToTransferAmount = tokensAmountAfterFee / exchangeRate;

        // Update fee tracking
        swapTokenFees += fee;

        // Transfer swap tokens from user to contract
        bool swapTransferSuccess = swapToken.transferFrom(msg.sender, address(this), amount);
        if (!swapTransferSuccess) revert TokenTransferFailed();

        // Transfer base tokens to user
        bool baseTransferSuccess = baseToken.transfer(msg.sender, tokensToTransferAmount);
        if (!baseTransferSuccess) revert TokenTransferFailed();

        emit TokensSold(msg.sender, amount, tokensToTransferAmount, fee);
    }

    // Admin Functions

    /**
     * @dev Update the exchange rate (only once per 90 days)
     * @param newRate New exchange rate
     */
    function setExchangeRate(uint256 newRate) external onlyOwner {
        if (block.timestamp < lastRateChangeTimestamp + RATE_CHANGE_COOLDOWN) revert RateLockStillActive();

        exchangeRate = newRate;
        lastRateChangeTimestamp = block.timestamp;

        emit ExchangeRateUpdated(newRate);
    }

    /**
     * @dev Update both buy and sell fee rates (only once per 90 days)
     * @param newBuyFeeBPS New buy fee in basis points
     * @param newSellFeeBPS New sell fee in basis points
     */
    function setFeeRates(uint256 newBuyFeeBPS, uint256 newSellFeeBPS) external onlyOwner {
        // Check cooldown period
        if (block.timestamp < lastFeeChangeTimestamp + APP_CHANGE_COOLDOWN) revert FeeLockStillActive();

        // Validate new fee rates
        if (newBuyFeeBPS > MAX_FEE_BPS || newSellFeeBPS > MAX_FEE_BPS) revert InvalidFeeBPS();

        buyFeeBPS = newBuyFeeBPS;
        sellFeeBPS = newSellFeeBPS;
        lastFeeChangeTimestamp = block.timestamp;

        emit FeeRatesUpdated(newBuyFeeBPS, newSellFeeBPS);
    }

    /**
     * @dev Check if fee rates can be changed
     * @return True if the fee change cooldown has passed, false otherwise
     */
    function canChangeFeeRates() external view returns (bool) {
        return block.timestamp >= lastFeeChangeTimestamp + APP_CHANGE_COOLDOWN;
    }

    function setDevAddress(address newDevAddress) external onlyOwner {
        if (newDevAddress == address(0)) revert InvalidDevAddress();
        if (block.timestamp < lastDevAddressChangeTimestamp + APP_CHANGE_COOLDOWN)
            revert AppChangeCooldownStillActive();
        DEV_ADDRESS = newDevAddress;
    }

    /**
     * @dev Withdraw accumulated fees to a specified address
     */
    function withdrawFees() external nonReentrant onlyAuthorized {
        address to = DEV_ADDRESS;
        uint256 baseTokenFeesToWithdraw = baseTokenFees;
        uint256 swapTokenFeesToWithdraw = swapTokenFees;

        // Reset fee tracking
        baseTokenFees = 0;
        swapTokenFees = 0;

        // Transfer base token fees
        if (baseTokenFeesToWithdraw > 0) {
            bool baseTransferSuccess = baseToken.transfer(to, baseTokenFeesToWithdraw);
            if (!baseTransferSuccess) revert TokenTransferFailed();
        }

        // Transfer swap token fees
        if (swapTokenFeesToWithdraw > 0) {
            bool swapTransferSuccess = swapToken.transfer(to, swapTokenFeesToWithdraw);
            if (!swapTransferSuccess) revert TokenTransferFailed();
        }

        emit FeesWithdrawn(to, baseTokenFeesToWithdraw, swapTokenFeesToWithdraw);
    }

    /**
     * @dev Withdraw ETH from the contract (only admin)
     */
    function withdrawETH() external nonReentrant onlyAuthorized {
        address to = DEV_ADDRESS;
        uint256 amount = address(this).balance;
        (bool success, ) = to.call{ value: amount }("");
        if (!success) revert ETHTransferFailed();

        emit ETHWithdrawn(to, amount);
    }

    // Whitelist Management Functions

    /**
     * @dev Add a collection to the whitelist
     * @param collectionAddress Address of the NFT collection to add
     */
    function addWhitelistedCollection(address collectionAddress) external onlyOwner {
        if (whitelistedCollections.length >= MAX_WHITELISTED_COLLECTIONS) revert ExceedsMaxWhitelistedCollections();
        if (_isCollectionWhitelisted(collectionAddress)) revert CollectionAlreadyAdded();

        whitelistedCollections.push(collectionAddress);
        emit WhitelistedCollectionAdded(collectionAddress);
    }

    /**
     * @dev Add multiple collections to the whitelist
     * @param collections Array of collection addresses to add
     */
    function batchAddWhitelistedCollections(address[] calldata collections) external onlyOwner {
        if (whitelistedCollections.length + collections.length > MAX_WHITELISTED_COLLECTIONS)
            revert ExceedsMaxWhitelistedCollections();

        for (uint256 i = 0; i < collections.length; i++) {
            if (!_isCollectionWhitelisted(collections[i])) {
                whitelistedCollections.push(collections[i]);
                emit WhitelistedCollectionAdded(collections[i]);
            }
        }
    }

    /**
     * @dev Remove a collection from the whitelist
     * @param collectionAddress Address of the NFT collection to remove
     */
    function removeWhitelistedCollection(address collectionAddress) external onlyOwner {
        uint256 index = _findCollectionIndex(collectionAddress);
        if (index >= whitelistedCollections.length) revert CollectionAddressNotFound();

        // Swap and pop pattern for efficient removal
        whitelistedCollections[index] = whitelistedCollections[whitelistedCollections.length - 1];
        whitelistedCollections.pop();

        emit WhitelistedCollectionRemoved(collectionAddress);
    }

    // Helper Functions

    /**
     * @dev Check if a user has a valid key to any of the whitelisted collections
     * @param user Address of the user to check
     * @return True if the user has a valid key, false otherwise
     */
    function hasValidKey(address user) public view returns (bool) {
        if (whitelistedCollections.length == 0) return false;

        for (uint256 i = 0; i < whitelistedCollections.length; i++) {
            IPublicLock lock = IPublicLock(whitelistedCollections[i]);
            if (lock.getHasValidKey(user)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Returns the address of the first collection for which the user has a valid key
     * @param user Address of the user to check
     * @return The address of the first valid collection, or address(0) if none found
     */
    function getFirstValidKeyCollection(address user) public view returns (address) {
        for (uint256 i = 0; i < whitelistedCollections.length; i++) {
            if (IPublicLock(whitelistedCollections[i]).getHasValidKey(user)) {
                return whitelistedCollections[i];
            }
        }
        return address(0); // Return address(0) if no valid lock is found
    }

    /**
     * @dev Check if a collection is already whitelisted
     * @param collectionAddress Address of the collection to check
     * @return True if the collection is whitelisted, false otherwise
     */
    function _isCollectionWhitelisted(address collectionAddress) internal view returns (bool) {
        for (uint256 i = 0; i < whitelistedCollections.length; i++) {
            if (whitelistedCollections[i] == collectionAddress) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Find the index of a collection in the whitelist
     * @param collectionAddress Address of the collection to find
     * @return The index of the collection, or the length of the array if not found
     */
    function _findCollectionIndex(address collectionAddress) internal view returns (uint256) {
        for (uint256 i = 0; i < whitelistedCollections.length; i++) {
            if (whitelistedCollections[i] == collectionAddress) {
                return i;
            }
        }
        return whitelistedCollections.length; // Not found
    }

    /**
     * @dev Get all whitelisted collections
     * @return Array of whitelisted collection addresses
     */
    function getWhitelistedCollections() external view returns (address[] memory) {
        return whitelistedCollections;
    }

    /**
     * @dev Check if a user can change the exchange rate
     * @return True if the rate change cooldown has passed, false otherwise
     */
    function canChangeExchangeRate() external view returns (bool) {
        return block.timestamp >= lastRateChangeTimestamp + RATE_CHANGE_COOLDOWN;
    }

    /**
     * @dev Receive function to allow the contract to receive ETH
     */
    receive() external payable {}
}
