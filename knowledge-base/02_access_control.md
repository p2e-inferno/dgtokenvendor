# DGTokenVendor Smart Contract: Access Control

This document describes the access control mechanisms and roles within the `DGTokenVendor` smart contract. Access control is primarily managed through a combination of ownership checks and custom modifiers that restrict certain functions to authorized addresses.

## 1. Core Roles

The contract defines several key roles, each with different permissions:

-   **User (NFT Holder):** The standard user who must hold a valid NFT from a whitelisted collection to access the main features.
-   **Owner:** The primary administrator with full control over the contract's settings.
-   **Developer (Dev):** A designated address responsible for fee collection and updating its own address.
-   **Steward Council:** A secondary administrative body (like a multisig) with the ability to pause and unpause the contract.
-   **Authorized:** A role that includes both the **Owner** and the **Developer**, used for functions they are both permitted to call (e.g., withdrawing fees).
-   **Admin:** A role that includes both the **Owner** and the **Steward Council**, used for functions they are both permitted to call (e.g., pausing the contract).

## 2. Access Control Modifiers

Modifiers are reusable pieces of code that check for certain conditions before allowing a function to execute. They are the primary tool for enforcing permissions.

### `onlyNFTHolder()`

This modifier ensures that the function caller holds a valid NFT key from one of the collections in the `whitelistedCollections` array.

-   **Check:** It calls the internal `hasValidKey(msg.sender)` function.
-   **Behavior:** If the user does not have a valid key, the transaction is reverted with a `NoValidKeyForUserFound()` error.
-   **Used In:**
    -   `buyTokens(uint256 amount)`
    -   `sellTokens(uint256 amount)`
    -   `lightUp()`
    -   `upgradeStage()`

### `onlyAuthorized()`

This modifier restricts a function to be callable only by the contract `owner` or the `systemState.devAddress`.

-   **Check:** It verifies if `msg.sender` is either the `owner()` or the `devAddress`.
-   **Behavior:** If the caller is not one of these two addresses, the transaction is reverted with an `UnauthorizedCaller()` error.
-   **Used In:**
    -   `withdrawFees()`
    -   `withdrawETH()`
    -   `initializeWhitelistedCollections(address[] calldata collections)`

### `onlyDev()`

This modifier restricts a function to be callable only by the `systemState.devAddress`.

-   **Check:** It verifies if `msg.sender` is the `devAddress`.
-   **Behavior:** If the caller is not the developer, the transaction is reverted with an `UnauthorizedCaller()` error.
-   **Used In:**
    -   `setDevAddress(address newDevAddress)`

### `onlyAdmin()`

This modifier restricts a function to be callable only by the contract `owner` or the `systemState.stewardCouncil` address.

-   **Check:** It verifies if `msg.sender` is either the `owner()` or the `stewardCouncil`.
-   **Behavior:** If the caller is not one of these two addresses, the transaction is reverted with an `UnauthorizedCaller()` error.
-   **Used In:**
    -   `pause()`
    -   `unpause()`

### `onlyOwner()`

This is a standard modifier from OpenZeppelin's `Ownable` contract. It restricts a function to be callable only by the contract's owner.

-   **Check:** It verifies if `msg.sender` is the `owner()`.
-   **Behavior:** If the caller is not the owner, the transaction is reverted.
-   **Used In:**
    -   `setExchangeRate(uint256 newRate)`
    -   `setFeeRates(uint256 newBuyFeeBPS, uint256 newSellFeeBPS)`
    -   `setStewardCouncilAddress(address _newCouncilAddress)`
    -   `setStageConfig(UserStage _stage, StageConfig calldata _config)`
    -   `setCooldownConfig(uint256 _rateChangeCooldown, uint256 _appChangeCooldown)`

## 3. Other Important Modifiers

These modifiers are not for access control but are critical for contract safety and state management.

-   `nonReentrant()`: From OpenZeppelin's `ReentrancyGuard`, this modifier protects a function from re-entrancy attacks, where a malicious contract calls back into the function before the first call is complete.
-   `whenNotPaused()`: From OpenZeppelin's `Pausable`, this modifier ensures that a function can only be executed when the contract is not in a paused state.
