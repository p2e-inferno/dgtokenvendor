// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/IDGTokenVendor.sol";

// Custom errors
error AppChangeCooldownStillActive();
error CollectionAddressNotFound();
error CollectionAlreadyAdded();
error DailySellLimitExceeded();
error ExceedsMaxWhitelistedCollections();
error ETHTransferFailed();
error FeeCooldownActive();
error InsufficientPointsForUpgrade();
error InsufficientFuelForUpgrade();
error InvalidFeeBPS();
error InvalidDevAddress();
error InvalidExchangeRate();
error InsufficientBalance();
error InvalidFuelRate();
error InvalidPointsAwarded();
error InvalidDailyLimitMultiplier();
error InvalidBurnAmount();
error InvalidUpgradePointsThreshold();
error InvalidUpgradeFuelThreshold();
error InvalidQualifyingBuyThreshold();
error InvalidCooldown();
error MinimumAmountNotMet();
error MaxStageReached();
error NoValidKeyForUserFound();
error RateCooldownActive();
error StageSellLimitExceeded();
error StageCooldownActive();
error UnauthorizedCaller();
error WhitelistedCollectionsAlreadyInitialized();

interface IPublicLock {
    function getHasValidKey(address _user) external view returns (bool);

    function tokenOfOwnerByIndex(address _user, uint256 _index) external view returns (uint256);
}

contract DGTokenVendor is Ownable, ReentrancyGuard, Pausable, IDGTokenVendor {
    using SafeERC20 for IERC20;

    // Core Constants
    uint256 public constant MAX_WHITELISTED_COLLECTIONS = 10;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_DAILY_MULTIPLIER = 100;
    uint256 public constant MAX_FUEL_LIMIT = 100;
    uint256 public constant MAX_FUEL_RATE = 5;
    uint256 public constant MAX_POINTS_AWARDED = 5;
    uint256 public constant MAX_SELL_BPS_LIMIT = 7000;
    address public constant BURN_ADDRESS = 0x2Ef7DeC913e4127Fd0f94B32eeAd23ee63143598;

    // State Variables
    StageConstants stageConstants;
    FeeConfig feeConfig;
    TokenConfig tokenConfig;
    SystemState systemState;
    address[] private whitelistedCollections;

    mapping(address => UserState) userStates;
    mapping(UserStage => StageConfig) stageConfig;

    modifier onlyNFTHolder() {
        if (!hasValidKey(msg.sender)) revert NoValidKeyForUserFound();
        _;
    }

    modifier onlyAuthorized() {
        if (!(msg.sender == owner() || msg.sender == systemState.devAddress)) revert UnauthorizedCaller();
        _;
    }

    constructor(
        address _baseToken,
        address _swapToken,
        uint256 _initialExchangeRate,
        address _devAddress
    ) Ownable(msg.sender) {
        if (_initialExchangeRate == 0) revert InvalidExchangeRate();
        // TODO: Uncomment this once the contract is ready to be deployed to mainnet
        // _initialize(_baseToken, _swapToken, _initialExchangeRate, _devAddress);

        //////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////
        //////////// TODO: Remove this once the contract is ready to be deployed to mainnet ////////////
        //////////// Testnet values use `_initialize()` for mainnet deployment ////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////
        tokenConfig = TokenConfig({
            baseToken: IERC20(_baseToken),
            swapToken: IERC20(_swapToken),
            exchangeRate: _initialExchangeRate
        });

        systemState = SystemState({
            baseTokenFees: 0,
            swapTokenFees: 0,
            lastRateChangeTimestamp: block.timestamp,
            lastFeeChangeTimestamp: block.timestamp,
            devAddress: _devAddress,
            lastDevAddressChangeTimestamp: block.timestamp
        });

        feeConfig = FeeConfig({
            maxFeeBps: 1000,
            buyFeeBps: 100,
            sellFeeBps: 200,
            rateChangeCooldown: 0 days,
            appChangeCooldown: 0 days
        });

        stageConstants = StageConstants({
            maxSellCooldown: 45 days,
            dailyWindow: 24 hours,
            minBuyAmount: 1000e18,
            minSellAmount: 5000e18
        }); 

        stageConfig[UserStage.PLEB] = StageConfig({
            burnAmount: 10e18,
            upgradePointsThreshold: 0,
            upgradeFuelThreshold: 5,
            fuelRate: 5,
            pointsAwarded: 5,
            qualifyingBuyThreshold: 1000e18,
            maxSellBps: 5000,
            dailyLimitMultiplier: 100
        });

        stageConfig[UserStage.HUSTLER] = StageConfig({
            burnAmount: 50e18,
            upgradePointsThreshold: 20,
            upgradeFuelThreshold: 15,
            fuelRate: 5,
            pointsAwarded: 5,
            qualifyingBuyThreshold: 5000e18,
            maxSellBps: 6000,
            dailyLimitMultiplier: 100
        });

        stageConfig[UserStage.OG] = StageConfig({
            burnAmount: 100e18,
            upgradePointsThreshold: 20,
            upgradeFuelThreshold: 20,
            fuelRate: 5,
            pointsAwarded: 5,
            qualifyingBuyThreshold: 20000e18,
            maxSellBps: 7000,
            dailyLimitMultiplier: 100
        });
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function buyTokens(uint256 amount) external nonReentrant onlyNFTHolder whenNotPaused {
        if (amount < stageConstants.minBuyAmount) revert MinimumAmountNotMet();
        if (tokenConfig.baseToken.balanceOf(msg.sender) < amount) revert InsufficientBalance();
        uint256 fee = (amount * feeConfig.buyFeeBps) / BASIS_POINTS;
        uint256 tokenToBuyAmount = (amount - fee) * tokenConfig.exchangeRate;

        systemState.baseTokenFees += fee;
        // Update user points
        UserState storage user = userStates[msg.sender];
        StageConfig memory config = stageConfig[user.stage];

        // Award points if threshold met
        if (amount >= config.qualifyingBuyThreshold) {
            user.points += config.pointsAwarded;
        }

        tokenConfig.baseToken.safeTransferFrom(msg.sender, address(this), amount);
        tokenConfig.swapToken.safeTransfer(msg.sender, tokenToBuyAmount);

        emit TokensPurchased(msg.sender, amount, tokenToBuyAmount, fee);
    }

    function sellTokens(uint256 amount) external nonReentrant onlyNFTHolder whenNotPaused {
        if (amount < stageConstants.minSellAmount) revert MinimumAmountNotMet();

        // Calculate token conversion and fees
        uint256 fee = (amount * feeConfig.sellFeeBps) / BASIS_POINTS;
        uint256 tokensAmountAfterFee = amount - fee;
        uint256 tokensToTransferAmount = tokensAmountAfterFee / tokenConfig.exchangeRate;
        if (tokensToTransferAmount == 0) revert MinimumAmountNotMet();

        UserState storage user = userStates[msg.sender];
        StageConfig memory config = stageConfig[user.stage];

        // Calculate maximum allowed transaction size
        uint256 contractBalance = tokenConfig.baseToken.balanceOf(address(this));
        uint256 maxTxSell = (contractBalance * config.maxSellBps) / BASIS_POINTS;

        // Validate transaction limits
        if (tokensToTransferAmount > maxTxSell) revert StageSellLimitExceeded();

        // Handle OG stage cooldown for max-sized transactions
        if (user.stage == UserStage.OG && tokensToTransferAmount == maxTxSell) {
            if (block.timestamp <= user.lastStage3MaxSale + stageConstants.maxSellCooldown) {
                revert StageCooldownActive();
            }
            user.lastStage3MaxSale = block.timestamp;
        }

        // Update daily tracking window
        if (block.timestamp > user.dailyWindowStart + stageConstants.dailyWindow) {
            user.dailySoldAmount = 0;
            user.dailyWindowStart = block.timestamp;
        }

        // Calculate and validate daily limit
        uint256 dailyLimit = config.qualifyingBuyThreshold * (config.dailyLimitMultiplier + user.fuel);
        if (user.dailySoldAmount + amount > dailyLimit) {
            revert DailySellLimitExceeded();
        }

        // Update state variables
        user.dailySoldAmount += amount;
        user.fuel = 0;
        systemState.swapTokenFees += fee;

        // Execute token transfers
        tokenConfig.swapToken.safeTransferFrom(msg.sender, address(this), amount);
        tokenConfig.baseToken.safeTransfer(msg.sender, tokensToTransferAmount);

        emit TokensSold(msg.sender, amount, tokensToTransferAmount, fee);
    }

    function lightUp() external onlyNFTHolder whenNotPaused nonReentrant {
        UserState storage user = userStates[msg.sender];
        StageConfig memory config = stageConfig[UserStage(user.stage)];

        tokenConfig.baseToken.safeTransferFrom(msg.sender, BURN_ADDRESS, config.burnAmount);

        uint256 newFuel = Math.min(user.fuel + config.fuelRate, MAX_FUEL_LIMIT);

        if (newFuel > user.fuel) user.fuel = newFuel;
        emit Lit(msg.sender, config.burnAmount, newFuel);
    }

    function upgradeStage() external onlyNFTHolder whenNotPaused nonReentrant {
        UserState storage user = userStates[msg.sender];
        if (user.stage == UserStage.OG) revert MaxStageReached(); 
        UserStage nextStage = UserStage(uint256(user.stage) + 1);

        if (user.points < stageConfig[nextStage].upgradePointsThreshold) revert InsufficientPointsForUpgrade();
        if (user.fuel < stageConfig[nextStage].upgradeFuelThreshold) revert InsufficientFuelForUpgrade();

        user.stage = nextStage;
        user.points = 0;
        user.fuel = 0;
        emit StageUpgraded(msg.sender, user.stage);
    }

    function setExchangeRate(uint256 newRate) external onlyOwner {
        if (block.timestamp < systemState.lastRateChangeTimestamp + feeConfig.rateChangeCooldown)
            revert RateCooldownActive();
        if (newRate == 0) revert InvalidExchangeRate();

        tokenConfig.exchangeRate = newRate;
        systemState.lastRateChangeTimestamp = block.timestamp;
        emit ExchangeRateUpdated(newRate);
    }

    function setFeeRates(uint256 newBuyFeeBPS, uint256 newSellFeeBPS) external onlyOwner {
        if (block.timestamp < systemState.lastFeeChangeTimestamp + feeConfig.appChangeCooldown)
            revert FeeCooldownActive();
        if (newBuyFeeBPS > feeConfig.maxFeeBps || newSellFeeBPS > feeConfig.maxFeeBps) revert InvalidFeeBPS();

        feeConfig.buyFeeBps = newBuyFeeBPS;
        feeConfig.sellFeeBps = newSellFeeBPS;
        systemState.lastFeeChangeTimestamp = block.timestamp;
        emit FeeRatesUpdated(newBuyFeeBPS, newSellFeeBPS);
    }

    function setDevAddress(address newDevAddress) external onlyOwner {
        if (newDevAddress == address(0)) revert InvalidDevAddress();
        if (block.timestamp < systemState.lastDevAddressChangeTimestamp + feeConfig.appChangeCooldown)
            revert AppChangeCooldownStillActive();
        systemState.devAddress = newDevAddress;
        systemState.lastDevAddressChangeTimestamp = block.timestamp;
        emit DevAddressUpdated(newDevAddress);
    }

    function withdrawFees() external nonReentrant onlyAuthorized whenNotPaused {
        address to = systemState.devAddress;
        uint256 baseTokenFeesToWithdraw = systemState.baseTokenFees;
        uint256 swapTokenFeesToWithdraw = systemState.swapTokenFees;

        systemState.baseTokenFees = 0;
        systemState.swapTokenFees = 0;

        if (baseTokenFeesToWithdraw > 0) {
            tokenConfig.baseToken.safeTransfer(to, baseTokenFeesToWithdraw);
        }

        if (swapTokenFeesToWithdraw > 0) {
            tokenConfig.swapToken.safeTransfer(to, swapTokenFeesToWithdraw);
        }

        emit FeesWithdrawn(to, baseTokenFeesToWithdraw, swapTokenFeesToWithdraw);
    }

    /**
     * @dev Withdraw ETH from the contract (only admin)
     */
    function withdrawETH() external nonReentrant onlyAuthorized whenNotPaused {
        address to = systemState.devAddress;
        uint256 amount = address(this).balance;
        (bool success, ) = to.call{ value: amount }("");
        if (!success) revert ETHTransferFailed();

        emit ETHWithdrawn(to, amount);
    }

    function addWhitelistedCollection(address collectionAddress) external onlyOwner {
        if (whitelistedCollections.length >= MAX_WHITELISTED_COLLECTIONS) revert ExceedsMaxWhitelistedCollections();
        if (_isCollectionWhitelisted(collectionAddress)) revert CollectionAlreadyAdded();

        whitelistedCollections.push(collectionAddress);
        emit WhitelistedCollectionAdded(collectionAddress);
    }

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

    function removeWhitelistedCollection(address collectionAddress) external onlyOwner {
        uint256 index = _findCollectionIndex(collectionAddress);
        if (index >= whitelistedCollections.length) revert CollectionAddressNotFound();

        whitelistedCollections[index] = whitelistedCollections[whitelistedCollections.length - 1];
        whitelistedCollections.pop();
        emit WhitelistedCollectionRemoved(collectionAddress);
    }

    function batchRemoveWhitelistedCollections(
        address[] calldata collections
    ) external onlyOwner {
        uint256 length = collections.length;
        for (uint256 i = length; i > 0; ) {
            unchecked {
                i--; 
            }
            
            address collection = collections[i];
            uint256 index = _findCollectionIndex(collection);
            if (index >= whitelistedCollections.length) {
                revert CollectionAddressNotFound();
            }

            uint256 lastIndex = whitelistedCollections.length - 1;
            if (index != lastIndex) {
                whitelistedCollections[index] = whitelistedCollections[lastIndex];
            }
            whitelistedCollections.pop();

            emit WhitelistedCollectionRemoved(collection);
        }
    }

    function initializeWhitelistedCollections(address[] calldata collections) external onlyAuthorized {
        if (whitelistedCollections.length + collections.length > MAX_WHITELISTED_COLLECTIONS)
            revert ExceedsMaxWhitelistedCollections();
        if (whitelistedCollections.length > 0) revert WhitelistedCollectionsAlreadyInitialized();

        for (uint256 i = 0; i < collections.length; i++) {
            if (!_isCollectionWhitelisted(collections[i])) {
                whitelistedCollections.push(collections[i]);
                emit WhitelistedCollectionAdded(collections[i]);
            }
        }
    }

    function canChangeFeeRates() external view returns (bool) {
        return block.timestamp >= systemState.lastFeeChangeTimestamp + feeConfig.appChangeCooldown;
    }

    function canChangeExchangeRate() external view returns (bool) {
        return block.timestamp >= systemState.lastRateChangeTimestamp + feeConfig.rateChangeCooldown;
    }

    function hasValidKey(address user) public view returns (bool) {
        if (whitelistedCollections.length == 0) return false;

        for (uint256 i = 0; i < whitelistedCollections.length; i++) {
            if (IPublicLock(whitelistedCollections[i]).getHasValidKey(user)) {
                return true;
            }
        }
        return false;
    }

    function getFirstValidCollection(address user) public view returns (address) {
        for (uint256 i = 0; i < whitelistedCollections.length; i++) {
            if (IPublicLock(whitelistedCollections[i]).getHasValidKey(user)) {
                return whitelistedCollections[i];
            }
        }
        return address(0);
    }

    function getStageConstants() public view returns (StageConstants memory _stageConstants) {
        _stageConstants = stageConstants;
    }

    function getFeeConfig() public view returns (FeeConfig memory _feeConfig) {
        _feeConfig = feeConfig;
    }

    function getTokenConfig() public view returns (TokenConfig memory _tokenConfig) {
        _tokenConfig = tokenConfig;
    }

    function getSystemState() public view returns (SystemState memory _systemState) {
        _systemState = systemState;
    }

    function getUserState(address user) public view returns (UserState memory _userState) {
        _userState = userStates[user];
    }

    function getStageConfig(UserStage _stage) public view returns (StageConfig memory _stageConfig) {
        _stageConfig = stageConfig[_stage];
    }

    function getExchangeRate() external view returns (uint256) {
        return tokenConfig.exchangeRate;
    }

    function getWhitelistedCollections() external view returns (address[] memory) {
        return whitelistedCollections;
    }

    function _isCollectionWhitelisted(address collectionAddress) internal view returns (bool) {
        for (uint256 i = 0; i < whitelistedCollections.length; i++) {
            if (whitelistedCollections[i] == collectionAddress) {
                return true;
            }
        }
        return false;
    }

    function _findCollectionIndex(address collectionAddress) internal view returns (uint256) {
        for (uint256 i = 0; i < whitelistedCollections.length; i++) {
            if (whitelistedCollections[i] == collectionAddress) {
                return i;
            }
        }
        return whitelistedCollections.length;
    }

    function setStageConfig(UserStage _stage, StageConfig calldata _config) external onlyOwner {
        uint256 minSellBps = 100;
        uint256 invalidLowerBound = 0;
        if (_config.maxSellBps < minSellBps || _config.maxSellBps > MAX_SELL_BPS_LIMIT) revert InvalidFeeBPS();
        if (_config.fuelRate == invalidLowerBound || _config.fuelRate > MAX_FUEL_RATE) revert InvalidFuelRate();
        if (_config.pointsAwarded == invalidLowerBound || _config.pointsAwarded > MAX_POINTS_AWARDED)
            revert InvalidPointsAwarded();
        if (_config.dailyLimitMultiplier == invalidLowerBound || _config.dailyLimitMultiplier > MAX_DAILY_MULTIPLIER)
            revert InvalidDailyLimitMultiplier();
        if (_config.burnAmount == invalidLowerBound) revert InvalidBurnAmount();
        if (_config.upgradePointsThreshold == invalidLowerBound) revert InvalidUpgradePointsThreshold();
        if (_config.upgradeFuelThreshold == invalidLowerBound) revert InvalidUpgradeFuelThreshold();
        if (_config.qualifyingBuyThreshold == invalidLowerBound) revert InvalidQualifyingBuyThreshold();

        StageConfig storage storedConfig = stageConfig[_stage];
        StageConfig memory oldConfig = storedConfig;

        storedConfig.burnAmount = _config.burnAmount;
        storedConfig.upgradePointsThreshold = _config.upgradePointsThreshold;
        storedConfig.upgradeFuelThreshold = _config.upgradeFuelThreshold;
        storedConfig.fuelRate = _config.fuelRate;
        storedConfig.pointsAwarded = _config.pointsAwarded;
        storedConfig.qualifyingBuyThreshold = _config.qualifyingBuyThreshold;
        storedConfig.maxSellBps = _config.maxSellBps;
        storedConfig.dailyLimitMultiplier = _config.dailyLimitMultiplier;

        emit StageConfigUpdated(_stage, oldConfig, storedConfig);
    }

    /**
     * @notice Updates the fee configuration
     * @param _rateChangeCooldown Cooldown for changing exchange rate
     * @param _appChangeCooldown Cooldown for changing app settings
     */
    function setCooldownConfig(uint256 _rateChangeCooldown, uint256 _appChangeCooldown) external onlyOwner {
        uint256 minCooldown = 14 days;
        uint256 maxCooldown = 180 days;
        if (_rateChangeCooldown < minCooldown || _rateChangeCooldown > maxCooldown) revert InvalidCooldown();
        if (_appChangeCooldown < minCooldown || _appChangeCooldown > maxCooldown) revert InvalidCooldown();

        feeConfig.rateChangeCooldown = _rateChangeCooldown;
        feeConfig.appChangeCooldown = _appChangeCooldown;
        emit FeeConfigUpdated(_rateChangeCooldown, _appChangeCooldown);
    }
    function _initialize(address _baseToken, address _swapToken, uint256 _initialExchangeRate, address _devAddress) private {
        // Initialize token config
        tokenConfig = TokenConfig({
            baseToken: IERC20(_baseToken),
            swapToken: IERC20(_swapToken),
            exchangeRate: _initialExchangeRate
        });

        // Initialize system state
        systemState = SystemState({
            baseTokenFees: 0,
            swapTokenFees: 0,
            lastRateChangeTimestamp: block.timestamp,
            lastFeeChangeTimestamp: block.timestamp,
            devAddress: _devAddress,
            lastDevAddressChangeTimestamp: block.timestamp
        });

        // Initialize fee config
        feeConfig = FeeConfig({
            maxFeeBps: 1000,
            buyFeeBps: 100,
            sellFeeBps: 200,
            rateChangeCooldown: 90 days,
            appChangeCooldown: 90 days
        });

        // Initialize stage constants
        stageConstants = StageConstants({
            maxSellCooldown: 45 days,
            dailyWindow: 24 hours,
            minBuyAmount: 1000e18,
            minSellAmount: 5000e18
        }); 

        // Configure stages
        stageConfig[UserStage.PLEB] = StageConfig({
            burnAmount: 10e18,
            upgradePointsThreshold: 0,
            upgradeFuelThreshold: 0,
            fuelRate: 1,
            pointsAwarded: 1,
            qualifyingBuyThreshold: 1000e18,
            maxSellBps: 5000,
            dailyLimitMultiplier: 100
        });

        stageConfig[UserStage.HUSTLER] = StageConfig({
            burnAmount: 100e18,
            upgradePointsThreshold: 50,
            upgradeFuelThreshold: 10,
            fuelRate: 2,
            pointsAwarded: 2,
            qualifyingBuyThreshold: 5000e18,
            maxSellBps: 6000,
            dailyLimitMultiplier: 100
        });

        stageConfig[UserStage.OG] = StageConfig({
            burnAmount: 500e18,
            upgradePointsThreshold: 500,
            upgradeFuelThreshold: 50,
            fuelRate: 5,
            pointsAwarded: 5,
            qualifyingBuyThreshold: 20000e18,
            maxSellBps: 7000,
            dailyLimitMultiplier: 100
        });
    }
    receive() external payable {}
}
