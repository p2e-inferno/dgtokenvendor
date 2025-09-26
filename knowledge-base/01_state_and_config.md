# DGTokenVendor Smart Contract: State & Configuration

This document details the state variables, constants, and data structures (structs) that form the data model of the `DGTokenVendor` contract.

## 1. Core Constants

These are fixed, unchangeable values that define global limits and parameters for the contract's logic.

-   `MAX_WHITELISTED_COLLECTIONS`: **10**
    -   The maximum number of NFT collections that can be whitelisted for access.
-   `BASIS_POINTS`: **10000**
    -   The denominator for calculating percentage-based fees (e.g., a fee of 100 BPS is 100/10000 = 1%).
-   `MAX_DAILY_MULTIPLIER`: **100**
    -   The maximum multiplier that can be applied to the `qualifyingBuyThreshold` to determine a user's daily sell limit.
-   `MAX_FUEL_LIMIT`: **100**
    -   The absolute maximum amount of "fuel" a user can accumulate.
-   `MAX_FUEL_RATE`: **5**
    -   The maximum rate at which fuel can be earned per `lightUp` action.
-   `MAX_POINTS_AWARDED`: **5**
    -   The maximum number of points that can be awarded for a qualifying buy.
-   `MAX_SELL_BPS_LIMIT`: **7000**
    -   The maximum percentage (in basis points, so 70%) of the contract's balance that a user in the highest stage can sell in a single transaction.
-   `BURN_ADDRESS`: **0x2Ef7DeC913e4127Fd0f94B32eeAd23ee63143598**
    -   The designated address where tokens are sent to be burned during the `lightUp` process.

## 2. Data Structures (Structs)

Structs are custom data types that group related variables together, organizing the contract's data.

### `StageConstants`

Stores global parameters related to the stage and timing mechanics.

-   `maxSellCooldown` (uint256): The cooldown period (in seconds) that an `OG` stage user must wait after making a maximum-sized sale before they can make another one.
-   `dailyWindow` (uint256): The duration (in seconds) of the rolling window for calculating a user's daily sell limit.
-   `minBuyAmount` (uint256): The minimum amount of `baseToken` a user must spend in a single `buyTokens` transaction.
-   `minSellAmount` (uint256): The minimum amount of `swapToken` a user must sell in a single `sellTokens` transaction.

### `FeeConfig`

Stores all parameters related to transaction fees and administrative cooldowns.

-   `maxFeeBps` (uint256): The maximum fee (in basis points) that can be set for buys or sells.
-   `minFeeBps` (uint256): The minimum fee (in basis points) that can be set.
-   `buyFeeBps` (uint256): The current fee percentage for `buyTokens` transactions.
-   `sellFeeBps` (uint256): The current fee percentage for `sellTokens` transactions.
-   `rateChangeCooldown` (uint256): The minimum time (in seconds) that must pass before the `exchangeRate` can be changed again.
-   `appChangeCooldown` (uint256): The minimum time (in seconds) that must pass before general app settings (like fees or the dev address) can be changed again.

### `TokenConfig`

Stores the contract addresses and configuration for the tokens involved in the exchange.

-   `baseToken` (IERC20): The contract address of the token used to purchase the `swapToken` (e.g., USDC).
-   `swapToken` (IERC20): The contract address of the token being sold by the vendor (e.g., DG Token).
-   `exchangeRate` (uint256): The rate at which `baseToken` is converted to `swapToken`. For example, a rate of 100 means 1 `baseToken` buys 100 `swapToken`.

### `SystemState`

Stores system-wide state variables that track fees and important timestamps.

-   `baseTokenFees` (uint256): The total amount of `baseToken` fees collected and waiting for withdrawal.
-   `swapTokenFees` (uint256): The total amount of `swapToken` fees collected and waiting for withdrawal.
-   `lastRateChangeTimestamp` (uint256): The timestamp of the last time the `exchangeRate` was modified.
-   `lastFeeChangeTimestamp` (uint256): The timestamp of the last time the `buyFeeBps` or `sellFeeBps` were modified.
-   `devAddress` (address): The designated address for withdrawing collected fees.
-   `stewardCouncil` (address): The address of the multisig or secondary admin.
-   `lastDevAddressChangeTimestamp` (uint256): The timestamp of the last time the `devAddress` was changed.

### `UserState`

Stores all the data specific to an individual user.

-   `stage` (UserStage): The user's current progression stage (`PLEB`, `HUSTLER`, or `OG`).
-   `points` (uint256): The number of points the user has accumulated towards the next stage.
-   `fuel` (uint256): The user's current fuel level.
-   `lastStage3MaxSale` (uint256): The timestamp of the last time the user, as an `OG`, performed a maximum-sized sale.
-   `dailySoldAmount` (uint256): The total amount of `swapToken` the user has sold within the current `dailyWindow`.
-   `dailyWindowStart` (uint256): The timestamp marking the beginning of the user's current daily tracking period.

### `StageConfig`

Stores the specific parameters and thresholds for each `UserStage`.

-   `burnAmount` (uint256): The amount of `baseToken` a user at this stage must burn to use the `lightUp` feature.
-   `upgradePointsThreshold` (uint256): The number of points required to upgrade *to* this stage.
-   `upgradeFuelThreshold` (uint256): The amount of fuel required to upgrade *to* this stage.
-   `fuelRate` (uint256): The amount of fuel gained per `lightUp` action at this stage.
-   `pointsAwarded` (uint256): The number of points awarded for a qualifying purchase at this stage.
-   `qualifyingBuyThreshold` (uint256): The minimum `buyTokens` amount required to earn points at this stage.
-   `maxSellBps` (uint256): The maximum percentage of the contract's `baseToken` balance that a user at this stage can receive from a single sale.
-   `dailyLimitMultiplier` (uint256): The multiplier used with `qualifyingBuyThreshold` to calculate the daily sell limit for a user at this stage.

## 3. State Variables

These are the top-level variables where the contract's state is stored.

-   `stageConstants` (StageConstants): An instance of the `StageConstants` struct, holding the global timing and amount settings.
-   `feeConfig` (FeeConfig): An instance of the `FeeConfig` struct.
-   `tokenConfig` (TokenConfig): An instance of the `TokenConfig` struct.
-   `systemState` (SystemState): An instance of the `SystemState` struct.
-   `whitelistedCollections` (address[]): A dynamic array storing the addresses of the whitelisted NFT collections.
-   `userStates` (mapping(address => UserState)): A mapping that links a user's wallet address to their individual `UserState` struct.
-   `stageConfig` (mapping(UserStage => StageConfig)): A mapping that links each `UserStage` enum to its specific `StageConfig` struct.
