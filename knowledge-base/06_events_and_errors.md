# DGTokenVendor Smart Contract: Events & Errors

This document provides a reference for all the events and custom errors defined in the `DGTokenVendor` contract. Events are used to log significant actions on the blockchain, while errors explain why a function call failed.

## 1. Events

Events are signals the contract emits when certain actions occur. Off-chain applications can listen for these events to track activity.

-   **`TokensPurchased(address indexed buyer, uint256 baseTokenAmount, uint256 swapTokenAmount, uint256 fee)`**
    -   Emitted when a user successfully buys tokens.
-   **`TokensSold(address indexed seller, uint256 swapTokenAmount, uint256 baseTokenAmount, uint256 fee)`**
    -   Emitted when a user successfully sells tokens.
-   **`Lit(address indexed user, uint256 burnAmount, uint256 newFuel)`**
    -   Emitted when a user successfully uses the `lightUp` function to gain fuel.
-   **`StageUpgraded(address indexed user, UserStage newStage)`**
    -   Emitted when a user successfully upgrades to a new stage.
-   **`FeesWithdrawn(address indexed to, uint256 baseTokenFees, uint256 swapTokenFees)`**
    -   Emitted when the developer or owner withdraws accumulated fees.
-   **`ETHWithdrawn(address indexed to, uint256 amount)`**
    -   Emitted when the developer or owner withdraws ETH from the contract.

### Admin & Configuration Events

-   **`WhitelistedCollectionAdded(address indexed collectionAddress)`**
    -   Emitted when a new NFT collection is added to the whitelist during initialization.
-   **`ExchangeRateUpdated(uint256 newRate)`**
    -   Emitted when the owner changes the token exchange rate.
-   **`DevAddressUpdated(address indexed newDevAddress)`**
    -   Emitted when the developer address is changed.
-   **`StewardCouncilAddressUpdated(address indexed newStewardCouncilAddress)`**
    -   Emitted when the owner changes the Steward Council address.
-   **`FeeRatesUpdated(uint256 newBuyFeeBPS, uint256 newSellFeeBPS)`**
    -   Emitted when the owner updates the buy and sell fee rates.
-   **`FeeConfigUpdated(uint256 rateChangeCooldown, uint256 appChangeCooldown)`**
    -   Emitted when the owner updates the administrative cooldown periods.
-   **`StageConfigUpdated(UserStage indexed stage, StageConfig oldConfig, StageConfig newConfig)`**
    -   Emitted when the owner modifies the configuration of a user stage.

## 2. Custom Errors

Custom errors are used to provide more specific and gas-efficient reasons for a transaction failure compared to simple `require` statements.

### User Action Errors

-   `MinimumAmountNotMet()`: The amount for a buy or sell is below the required minimum.
-   `InsufficientBalance()`: The user does not have enough tokens for the transaction.
-   `DailySellLimitExceeded()`: The user has tried to sell more tokens than their daily limit allows.
-   `StageSellLimitExceeded()`: The user tried to execute a single sale larger than their stage permits.
-   `StageCooldownActive()`: An `OG` user tried to make a second max-sized sale before the cooldown expired.
-   `MaxStageReached()`: A user at the `OG` stage tried to call `upgradeStage()`.
-   `InsufficientPointsForUpgrade()`: The user does not have enough points to upgrade.
-   `InsufficientFuelForUpgrade()`: The user does not have enough fuel to upgrade.
-   `NoValidKeyForUserFound()`: The caller does not hold an NFT from a whitelisted collection.

### Admin Action Errors

-   `UnauthorizedCaller()`: The caller is not authorized for a restricted function (e.g., not owner, dev, or admin).
-   `AppChangeCooldownStillActive()`: An admin tried to change a setting (like the dev address) before the cooldown expired.
-   `FeeCooldownActive()`: An admin tried to change fee rates before the cooldown expired.
-   `RateCooldownActive()`: An admin tried to change the exchange rate before the cooldown expired.
-   `InvalidFeeBPS()`: The provided fee value is outside the acceptable range (min/max).
-   `InvalidDevAddress()`: The new developer address is the zero address.
-   `InvalidExchangeRate()`: The new exchange rate is zero or too high.
-   `InvalidCooldown()`: The provided cooldown duration is outside the acceptable range.
-   `ExceedsMaxWhitelistedCollections()`: Trying to initialize with more NFT collections than the `MAX_WHITELISTED_COLLECTIONS` limit.
-   `WhitelistedCollectionsAlreadyInitialized()`: Trying to call `initializeWhitelistedCollections` after it has already been run.

### Stage Configuration Errors

-   `InvalidFuelRate()`: The `fuelRate` in a new `StageConfig` is invalid.
-   `InvalidPointsAwarded()`: The `pointsAwarded` in a new `StageConfig` is invalid.
-   `InvalidDailyLimitMultiplier()`: The `dailyLimitMultiplier` in a new `StageConfig` is invalid.
-   `InvalidBurnAmount()`: The `burnAmount` in a new `StageConfig` is invalid.
-   `InvalidUpgradePointsThreshold()`: The `upgradePointsThreshold` in a new `StageConfig` is invalid.
-   `InvalidUpgradeFuelThreshold()`: The `upgradeFuelThreshold` in a new `StageConfig` is invalid.
-   `InvalidQualifyingBuyThreshold()`: The `qualifyingBuyThreshold` in a new `StageConfig` is invalid.

### System Errors

-   `ETHTransferFailed()`: The contract failed to send ETH during a withdrawal.
