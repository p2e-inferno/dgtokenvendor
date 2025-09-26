# DGTokenVendor Smart Contract: User Functions

This document explains the primary functions that are intended for direct use by end-users (NFT holders). Access to all these functions is protected by the `onlyNFTHolder` modifier, meaning the caller must have a valid key from a whitelisted NFT collection.

## 1. `buyTokens(uint256 amount)`

This function allows a user to purchase `swapToken` by spending their `baseToken`.

-   **Purpose:** To exchange `baseToken` for `swapToken`.
-   **Parameter:**
    -   `amount` (uint256): The amount of `baseToken` the user wishes to spend.
-   **Access Control:** `onlyNFTHolder`, `whenNotPaused`

### Process Flow:

1.  **Minimum Amount Check:** It first checks if the `amount` is greater than or equal to `stageConstants.minBuyAmount`. If not, it reverts with `MinimumAmountNotMet()`.
2.  **Balance Check:** It verifies that the user has enough `baseToken` to cover the `amount`. If not, it reverts with `InsufficientBalance()`.
3.  **Fee Calculation:** A `buyFeeBps` percentage is calculated from the `amount` and set aside as a fee.
4.  **Token Calculation:** The remaining amount (after the fee) is multiplied by the current `tokenConfig.exchangeRate` to determine how much `swapToken` the user will receive.
5.  **Points Award:** If the `amount` spent is greater than or equal to the `qualifyingBuyThreshold` for the user's current stage, the user is awarded `pointsAwarded` for their stage. This is how users accumulate points for stage upgrades.
6.  **Token Transfers:**
    -   The full `amount` of `baseToken` is transferred from the user to the contract.
    -   The calculated `swapToken` amount is transferred from the contract to the user.
7.  **Event:** Emits a `TokensPurchased` event with the details of the transaction.

## 2. `sellTokens(uint256 amount)`

This function allows a user to sell their `swapToken` to receive `baseToken` in return.

-   **Purpose:** To exchange `swapToken` for `baseToken`.
-   **Parameter:**
    -   `amount` (uint256): The amount of `swapToken` the user wishes to sell.
-   **Access Control:** `onlyNFTHolder`, `whenNotPaused`

### Process Flow:

1.  **Minimum Amount Check:** It checks if the `amount` is at least `stageConstants.minSellAmount`. If not, it reverts.
2.  **Fee Calculation:** A `sellFeeBps` percentage is calculated from the `amount` and set aside as a fee.
3.  **Token Calculation:** The remaining `swapToken` amount is divided by the `exchangeRate` to determine how much `baseToken` the user will receive.
4.  **Sell Limit Checks:** This is the most complex part of the function:
    -   **Stage Sell Limit:** It calculates the maximum single transaction sell amount (`maxTxSell`) based on the contract's `baseToken` balance and the user's stage-specific `maxSellBps`. If the user tries to receive more `baseToken` than this limit, the transaction reverts with `StageSellLimitExceeded()`.
    -   **Daily Sell Limit:** It checks and updates the user's `dailySoldAmount` against a calculated `dailyLimit`. This daily limit is determined by the user's `qualifyingBuyThreshold`, `dailyLimitMultiplier`, and their current `fuel` level. Selling consumes any available `fuel`. If the daily limit is exceeded, it reverts with `DailySellLimitExceeded()`.
    -   **OG Cooldown:** If the user is at the `OG` stage and performs a `maxTxSell`, a cooldown (`stageConstants.maxSellCooldown`) is initiated, preventing another max-sized sale until the cooldown expires.
5.  **State Updates:**
    -   The user's `dailySoldAmount` is increased.
    -   The user's `fuel` is reset to **0**.
    -   The collected `swapTokenFees` in the contract are increased.
6.  **Token Transfers:**
    -   The `amount` of `swapToken` is transferred from the user to the contract.
    -   The calculated `baseToken` amount is transferred from the contract to the user.
7.  **Event:** Emits a `TokensSold` event with the transaction details.

## 3. `lightUp()`

This function allows a user to burn a small amount of `baseToken` to increase their `fuel` level.

-   **Purpose:** To gain `fuel`, which is a resource needed for stage upgrades and for temporarily increasing daily sell limits.
-   **Parameters:** None.
-   **Access Control:** `onlyNFTHolder`, `whenNotPaused`

### Process Flow:

1.  **Token Transfer:** The contract transfers a `burnAmount` of `baseToken` (determined by the user's stage) from the user to the `BURN_ADDRESS`.
2.  **Fuel Update:** The user's `fuel` is increased by the `fuelRate` corresponding to their stage. The new fuel level is capped at `MAX_FUEL_LIMIT`.
3.  **Event:** Emits a `Lit` event, logging the user, the amount burned, and their new fuel level.

## 4. `upgradeStage()`

This function allows a user to advance to the next `UserStage` if they meet the requirements.

-   **Purpose:** To move from `PLEB` -> `HUSTLER` or `HUSTLER` -> `OG`.
-   **Parameters:** None.
-   **Access Control:** `onlyNFTHolder`, `whenNotPaused`

### Process Flow:

1.  **Max Stage Check:** It first checks if the user is already at the highest stage (`OG`). If so, it reverts with `MaxStageReached()`.
2.  **Requirement Checks:** It verifies that the user has met the upgrade criteria for the *next* stage:
    -   `user.points` must be >= `stageConfig[nextStage].upgradePointsThreshold`.
    -   `user.fuel` must be >= `stageConfig[nextStage].upgradeFuelThreshold`.
    -   If either check fails, it reverts with `InsufficientPointsForUpgrade()` or `InsufficientFuelForUpgrade()`.
3.  **State Update:**
    -   The user's `stage` is incremented to the next level.
    -   The user's `points` and `fuel` are reset to **0**.
4.  **Event:** Emits a `StageUpgraded` event, announcing the user's new stage.
