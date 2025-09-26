# DGTokenVendor Smart Contract: Admin Functions

This document details the administrative functions of the `DGTokenVendor` contract. These functions are restricted to authorized roles (`Owner`, `Dev`, `Steward Council`, `Admin`) and are used to manage the contract's parameters, security, and funds.

## 1. Ownership and High-Level Control

These functions are typically restricted to the `onlyOwner` or `onlyAdmin` modifiers.

### `pause()` & `unpause()`

-   **Purpose:** To halt or resume the core functions of the contract in an emergency.
-   **Access:** `onlyAdmin` (callable by `Owner` and `Steward Council`).
-   **Action:** Sets the contract's `paused` state to `true` or `false`. When paused, modifiers like `whenNotPaused` will cause functions like `buyTokens` and `sellTokens` to revert.

### `setStewardCouncilAddress(address _newCouncilAddress)`

-   **Purpose:** To update the address of the `Steward Council`.
-   **Access:** `onlyOwner`.
-   **Action:** Changes the `systemState.stewardCouncil` address. Reverts if the new address is the zero address.
-   **Event:** `StewardCouncilAddressUpdated`

## 2. Financial and Rate Management

These functions control the economic parameters of the token vendor.

### `setExchangeRate(uint256 newRate)`

-   **Purpose:** To set the exchange rate between the `baseToken` and `swapToken`.
-   **Access:** `onlyOwner`.
-   **Action:** Updates `tokenConfig.exchangeRate`. It includes a cooldown (`feeConfig.rateChangeCooldown`) to prevent rapid changes and validates that the `newRate` is not zero and not excessively high.
-   **Event:** `ExchangeRateUpdated`

### `setFeeRates(uint256 newBuyFeeBPS, uint256 newSellFeeBPS)`

-   **Purpose:** To update the percentage fees for buying and selling tokens.
-   **Access:** `onlyOwner`.
-   **Action:** Updates `feeConfig.buyFeeBps` and `feeConfig.sellFeeBps`. It includes a cooldown (`feeConfig.appChangeCooldown`) and ensures the new fees are within the allowed `minFeeBps` and `maxFeeBps` limits.
-   **Event:** `FeeRatesUpdated`

### `withdrawFees()`

-   **Purpose:** To withdraw the accumulated `baseToken` and `swapToken` fees from the contract.
-   **Access:** `onlyAuthorized` (callable by `Owner` and `Dev`).
-   **Action:** Transfers the entire balance of `systemState.baseTokenFees` and `systemState.swapTokenFees` to the `systemState.devAddress` and resets the fee counters to zero.
-   **Event:** `FeesWithdrawn`

### `withdrawETH()`

-   **Purpose:** To withdraw any Ether (ETH) that may have been accidentally sent to the contract.
-   **Access:** `onlyAuthorized` (callable by `Owner` and `Dev`).
-   **Action:** Transfers the entire ETH balance of the contract to the `systemState.devAddress`.
-   **Event:** `ETHWithdrawn`

## 3. Configuration and System Settings

These functions manage the operational parameters of the contract's features.

### `setDevAddress(address newDevAddress)`

-   **Purpose:** To change the address that receives withdrawn fees.
-   **Access:** `onlyDev`.
-   **Action:** Updates `systemState.devAddress`. This function has its own cooldown (`feeConfig.appChangeCooldown`) and can only be called by the current developer, allowing them to transfer their role.
-   **Event:** `DevAddressUpdated`

### `initializeWhitelistedCollections(address[] calldata collections)`

-   **Purpose:** To set the initial list of NFT collections that grant access to the vendor.
-   **Access:** `onlyAuthorized` (callable by `Owner` and `Dev`).
-   **Action:** Populates the `whitelistedCollections` array. This function can only be called once and will revert if the list is already populated, ensuring the initial setup is immutable.
-   **Event:** `WhitelistedCollectionAdded` for each collection.

### `setStageConfig(UserStage _stage, StageConfig calldata _config)`

-   **Purpose:** To update the specific parameters for any of the user stages (`PLEB`, `HUSTLER`, `OG`).
-   **Access:** `onlyOwner`.
-   **Action:** Allows the owner to fine-tune the entire configuration for a stage, including burn amounts, upgrade thresholds, fuel rates, points awarded, and sell limits. It performs numerous validation checks to ensure the new parameters are within safe and logical bounds.
-   **Event:** `StageConfigUpdated`

### `setCooldownConfig(uint256 _rateChangeCooldown, uint256 _appChangeCooldown)`

-   **Purpose:** To update the cooldown periods for administrative actions.
-   **Access:** `onlyOwner`.
-   **Action:** Modifies `feeConfig.rateChangeCooldown` and `feeConfig.appChangeCooldown`. The new values must be within a predefined range (e.g., between 14 and 180 days) to prevent them from being set to trivial or excessively long durations.
-   **Event:** `FeeConfigUpdated`
