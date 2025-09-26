# DGTokenVendor Smart Contract: View Functions

This document describes the `view` functions in the `DGTokenVendor` contract. These functions are read-only, meaning they do not modify the contract's state and do not cost any gas to call (when accessed externally). They are used to retrieve data about the contract's configuration, system state, and individual user data.

## 1. User-Specific View Functions

These functions provide information about a specific user.

### `getUserState(address user)`

-   **Purpose:** To retrieve the entire `UserState` struct for a given user address.
-   **Parameter:**
    -   `user` (address): The address of the user to query.
-   **Returns:** A `UserState` struct containing the user's stage, points, fuel, and other personal metrics.

### `hasValidKey(address user)`

-   **Purpose:** To check if a user holds a valid NFT from any of the whitelisted collections.
-   **Parameter:**
    -   `user` (address): The address of the user to check.
-   **Returns:** `true` if the user has a valid key, `false` otherwise.

### `getFirstValidCollection(address user)`

-   **Purpose:** To find and return the address of the first whitelisted NFT collection in which the user holds a valid key.
-   **Parameter:**
    -   `user` (address): The address of the user to check.
-   **Returns:** The `address` of the NFT collection contract if a key is found, otherwise returns the `zero address`.

## 2. Configuration and State View Functions

These functions return the contract's various configuration structs and system-wide state.

### `getStageConstants()`

-   **Purpose:** To retrieve the `StageConstants` struct.
-   **Returns:** The `StageConstants` struct, containing global values like `maxSellCooldown`, `dailyWindow`, `minBuyAmount`, and `minSellAmount`.

### `getFeeConfig()`

-   **Purpose:** To retrieve the `FeeConfig` struct.
-   **Returns:** The `FeeConfig` struct, containing all fee-related parameters and administrative cooldowns.

### `getTokenConfig()`

-   **Purpose:** To retrieve the `TokenConfig` struct.
-   **Returns:** The `TokenConfig` struct, containing the addresses of the `baseToken` and `swapToken` and the current `exchangeRate`.

### `getSystemState()`

-   **Purpose:** To retrieve the `SystemState` struct.
-   **Returns:** The `SystemState` struct, containing data on accumulated fees, admin addresses, and important timestamps.

### `getStageConfig(UserStage _stage)`

-   **Purpose:** To retrieve the specific `StageConfig` for a given user stage.
-   **Parameter:**
    -   `_stage` (UserStage): The stage (`PLEB`, `HUSTLER`, or `OG`) to query.
-   **Returns:** The `StageConfig` struct with all the parameters for that specific stage.

### `getExchangeRate()`

-   **Purpose:** A direct way to get the current token exchange rate.
-   **Returns:** The `uint256` value of `tokenConfig.exchangeRate`.

### `getWhitelistedCollections()`

-   **Purpose:** To get the list of all whitelisted NFT collection addresses.
-   **Returns:** An array of `address`es representing the NFT contracts that grant access to the vendor.

## 3. Cooldown Status View Functions

These functions allow anyone to check if administrative cooldowns are currently active.

### `canChangeFeeRates()`

-   **Purpose:** To check if the cooldown period for changing fee rates has passed.
-   **Returns:** `true` if the `appChangeCooldown` has elapsed since the last fee change, `false` otherwise.

### `canChangeExchangeRate()`

-   **Purpose:** To check if the cooldown period for changing the exchange rate has passed.
-   **Returns:** `true` if the `rateChangeCooldown` has elapsed since the last rate change, `false` otherwise.
