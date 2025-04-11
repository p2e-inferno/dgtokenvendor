// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IDGTokenVendor
 * @author Danny Thomx
 * @notice Interface for the DGTokenVendor contract
 * @dev Contains all external and public functions of the DGTokenVendor contract
 */
interface IDGTokenVendor {
    /* ========== ENUMS & STRUCTS ========== */

    /**
     * @notice User progression stages
     */
    enum UserStage {
        PLEB, // Entry level
        HUSTLER, // Mid level
        OG // Top level
    }

    /**
     * @notice Configuration for each user stage
     * @param burnAmount Amount of tokens burned for "light up" feature
     * @param upgradePointsThreshold Points needed for upgrading to next stage
     * @param upgradeFuelThreshold Fuel threshold for upgrade
     * @param fuelRate Rate at which fuel increases
     * @param pointsAwarded Points awarded for qualifying buy
     * @param qualifyingBuyThreshold Minimum buy amount to earn points at this stage
     * @param maxSellBps Maximum percentage of contract balance that can be sold in one tx
     * @param dailyLimitMultiplier Multiplier for daily sell limit
     */
    struct StageConfig {
        uint256 burnAmount;
        uint256 upgradePointsThreshold;
        uint256 upgradeFuelThreshold;
        uint256 fuelRate;
        uint256 pointsAwarded;
        uint256 qualifyingBuyThreshold;
        uint256 maxSellBps;
        uint256 dailyLimitMultiplier;
    }

    /**
     * @notice Constants for stage system timing and minimum amounts
     * @param cooldown Cooldown period between stage operations
     * @param dailyWindow Time window for daily limits
     * @param minBuyAmount Minimum amount for buying tokens
     * @param minSellAmount Minimum amount for selling tokens
     */
    struct StageConstants {
        uint256 cooldown;
        uint256 dailyWindow;
        uint256 minBuyAmount;
        uint256 minSellAmount;
    }

    /**
     * @notice Individual user state
     * @param stage Current user stage
     * @param points Points earned toward next stage
     * @param fuel Current fuel level
     * @param lastStage3MaxSale Timestamp of last maximum stage 3 sale
     * @param dailySoldAmount Amount sold in current daily window
     * @param dailyWindowStart Start timestamp of current daily window
     */
    struct UserState {
        UserStage stage;
        uint256 points;
        uint256 fuel;
        uint256 lastStage3MaxSale;
        uint256 dailySoldAmount;
        uint256 dailyWindowStart;
    }

    /**
     * @notice Fee configuration
     * @param maxFeeBps Maximum fee in basis points
     * @param buyFeeBps Fee for buying tokens in basis points
     * @param sellFeeBps Fee for selling tokens in basis points
     * @param rateChangeCooldown Cooldown for changing exchange rate
     * @param appChangeCooldown Cooldown for changing app settings
     */
    struct FeeConfig {
        uint256 maxFeeBps;
        uint256 buyFeeBps;
        uint256 sellFeeBps;
        uint256 rateChangeCooldown;
        uint256 appChangeCooldown;
    }

    /**
     * @notice Token configuration
     * @param baseToken The base token contract
     * @param swapToken The swap token contract
     * @param exchangeRate Exchange rate between tokens
     */
    struct TokenConfig {
        IERC20 baseToken;
        IERC20 swapToken;
        uint256 exchangeRate;
    }

    /**
     * @notice System state variables
     * @param baseTokenFees Accumulated fees in base token
     * @param swapTokenFees Accumulated fees in swap token
     * @param lastRateChangeTimestamp Last time exchange rate was changed
     * @param lastFeeChangeTimestamp Last time fees were changed
     * @param devAddress Developer address for fee withdrawal
     * @param lastDevAddressChangeTimestamp Last time dev address was changed
     */
    struct SystemState {
        uint256 baseTokenFees;
        uint256 swapTokenFees;
        uint256 lastRateChangeTimestamp;
        uint256 lastFeeChangeTimestamp;
        address devAddress;
        uint256 lastDevAddressChangeTimestamp;
    }

    /* ========== EVENTS ========== */

    /**
     * @notice Emitted when tokens are purchased
     * @param buyer Address of the buyer
     * @param baseTokenAmount Amount of base tokens used
     * @param swapTokenAmount Amount of swap tokens received
     * @param fee Fee taken in base tokens
     */
    event TokensPurchased(address indexed buyer, uint256 baseTokenAmount, uint256 swapTokenAmount, uint256 fee);

    /**
     * @notice Emitted when tokens are sold
     * @param seller Address of the seller
     * @param swapTokenAmount Amount of swap tokens sold
     * @param baseTokenAmount Amount of base tokens received
     * @param fee Fee taken in swap tokens
     */
    event TokensSold(address indexed seller, uint256 swapTokenAmount, uint256 baseTokenAmount, uint256 fee);

    /**
     * @notice Emitted when a collection is added to whitelist
     * @param collectionAddress Address of the added collection
     */
    event WhitelistedCollectionAdded(address indexed collectionAddress);

    /**
     * @notice Emitted when a collection is removed from whitelist
     * @param collectionAddress Address of the removed collection
     */
    event WhitelistedCollectionRemoved(address indexed collectionAddress);

    /**
     * @notice Emitted when exchange rate is updated
     * @param newRate New exchange rate
     */
    event ExchangeRateUpdated(uint256 newRate);

    /**
     * @notice Emitted when the developer address is updated
     * @param newDevAddress The new developer address
     */
    event DevAddressUpdated(address indexed newDevAddress);

    /**
     * @notice Emitted when fees are withdrawn
     * @param to Address receiving the fees
     * @param baseTokenFees Amount of base token fees withdrawn
     * @param swapTokenFees Amount of swap token fees withdrawn
     */
    event FeesWithdrawn(address indexed to, uint256 baseTokenFees, uint256 swapTokenFees);

    /**
     * @notice Emitted when ETH is withdrawn
     * @param to Address receiving the ETH
     * @param amount Amount of ETH withdrawn
     */
    event ETHWithdrawn(address indexed to, uint256 amount);

    /**
     * @notice Emitted when fee rates are updated
     * @param newBuyFeeBPS New buy fee rate in basis points
     * @param newSellFeeBPS New sell fee rate in basis points
     */
    event FeeRatesUpdated(uint256 newBuyFeeBPS, uint256 newSellFeeBPS);

    /**
     * @notice Emitted when a user upgrades to a new stage
     * @param user User address
     * @param newStage New stage of the user
     */
    event StageUpgraded(address indexed user, UserStage newStage);

    /**
     * @notice Emitted when a user uses the light up feature
     * @param user User address
     * @param burnAmount Amount of tokens burned
     * @param newFuel New fuel level
     */
    event Lit(address indexed user, uint256 burnAmount, uint256 newFuel);

    /**
     * @notice Emitted when stage constants are updated
     * @param parameter The name of the updated parameter
     * @param value The new value
     */
    event StageConstantsUpdated(string parameter, uint256 value);

    /**
     * @notice Emitted when fee configuration cooldowns are updated
     * @param rateChangeCooldown New rate change cooldown
     * @param appChangeCooldown New app change cooldown
     */
    event FeeConfigUpdated(uint256 rateChangeCooldown, uint256 appChangeCooldown);

    /**
     * @notice Emitted when stage configuration is updated
     * @param stage The stage being updated
     * @param oldConfig Previous configuration
     * @param newConfig New configuration
     */
    event StageConfigUpdated(UserStage indexed stage, StageConfig oldConfig, StageConfig newConfig);

    /* ========== CORE CONSTANTS ========== */
    function MAX_WHITELISTED_COLLECTIONS() external pure returns (uint256);

    function BASIS_POINTS() external pure returns (uint256);

    function MAX_DAILY_MULTIPLIER() external pure returns (uint256);

    function MAX_FUEL_LIMIT() external pure returns (uint256);

    function MAX_FUEL_RATE() external pure returns (uint256);

    function MAX_POINTS_AWARDED() external pure returns (uint256);

    function MAX_SELL_BPS_LIMIT() external pure returns (uint256);

    function BURN_ADDRESS() external pure returns (address);

    /* ========== USER FUNCTIONS ========== */

    /**
     * @notice Buy tokens using base token
     * @param amount Amount of base token to use for purchase
     */
    function buyTokens(uint256 amount) external;

    /**
     * @notice Sell tokens to receive base token
     * @param amount Amount of swap token to sell
     */
    function sellTokens(uint256 amount) external;

    /**
     * @notice Increase user's fuel by burning tokens
     */
    function lightUp() external;

    /**
     * @notice Upgrade user to next stage when requirements are met
     */
    function upgradeStage() external;

    /* ========== ADMIN FUNCTIONS ========== */

    /**
     * @notice Set new exchange rate
     * @param newRate New exchange rate
     */
    function setExchangeRate(uint256 newRate) external;

    /**
     * @notice Set new fee rates
     * @param newBuyFeeBPS New buy fee in basis points
     * @param newSellFeeBPS New sell fee in basis points
     */
    function setFeeRates(uint256 newBuyFeeBPS, uint256 newSellFeeBPS) external;

    /**
     * @notice Set new developer address
     * @param newDevAddress New developer address
     */
    function setDevAddress(address newDevAddress) external;

    /**
     * @notice Withdraw accumulated fees
     */
    function withdrawFees() external;

    /**
     * @notice Withdraw ETH from the contract
     */
    function withdrawETH() external;

    /**
     * @notice Add a new whitelisted collection
     * @param collectionAddress Address of collection to whitelist
     */
    function addWhitelistedCollection(address collectionAddress) external;

    /**
     * @notice Remove a whitelisted collection
     * @param collectionAddress Address of collection to remove
     */
    function removeWhitelistedCollection(address collectionAddress) external;

    /**
     * @notice Initialize the whitelisted collections 
     * @param collections Array of collection addresses to whitelist
     */
    function initializeWhitelistedCollections(address[] calldata collections) external;

    /**
     * @notice Batch add whitelisted collections
     * @param _collectionAddresses Array of collection addresses to add
     */
    function batchAddWhitelistedCollections(address[] memory _collectionAddresses) external;

    /**
     * @notice Update stage configuration
     * @param _stage The stage to update
     * @param _config New configuration for the stage
     */
    function setStageConfig(UserStage _stage, StageConfig calldata _config) external;

    /**
     * @notice Update cooldown configuration
     * @param _rateChangeCooldown New rate change cooldown
     * @param _appChangeCooldown New app change cooldown
     */
    function setCooldownConfig(uint256 _rateChangeCooldown, uint256 _appChangeCooldown) external;

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice Check if fee rates can be changed
     * @return bool Whether fee rates can be changed
     */
    function canChangeFeeRates() external view returns (bool);

    /**
     * @notice Check if exchange rate can be changed
     * @return bool Whether exchange rate can be changed
     */
    function canChangeExchangeRate() external view returns (bool);

    /**
     * @notice Check if user has a valid NFT key
     * @param user Address to check
     * @return bool Whether user has a valid key
     */
    function hasValidKey(address user) external view returns (bool);

    /**
     * @notice Get the whitelisted collection for the first valid key a user has
     * @param user Address to check
     * @return address First valid collection address
     */
    function getFirstValidCollection(address user) external view returns (address);

    /**
     * @notice Get all whitelisted collections
     * @return address[] Array of whitelisted collection addresses
     */
    function getWhitelistedCollections() external view returns (address[] memory);

    /**
     * @notice Get stage constants
     * @return _stageConstants The stage constants
     */
    function getStageConstants() external view returns (StageConstants memory _stageConstants);

    /**
     * @notice Get fee configuration
     * @return _feeConfig The fee configuration
     */
    function getFeeConfig() external view returns (FeeConfig memory _feeConfig);

    /**
     * @notice Get token configuration
     * @return _tokenConfig The token configuration
     */
    function getTokenConfig() external view returns (TokenConfig memory _tokenConfig);

    /**
     * @notice Get system state
     * @return _systemState The system state
     */
    function getSystemState() external view returns (SystemState memory _systemState);

    /**
     * @notice Get user state
     * @param user The user address
     * @return _userState The user state
     */
    function getUserState(address user) external view returns (UserState memory _userState);

    /**
     * @notice Get stage configuration
     * @param _stage The stage to get configuration for
     * @return _stageConfig The stage configuration
     */
    function getStageConfig(UserStage _stage) external view returns (StageConfig memory _stageConfig);
}
