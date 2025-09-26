# DGTokenVendor Smart Contract: Overview

## 1. Primary Purpose

The `DGTokenVendor` smart contract is a decentralized application that facilitates the exchange of a "base" token for a "swap" token. It is designed as a comprehensive ecosystem with features that go beyond simple token swapping, creating a gamified experience for users. The core functionality is to allow users to buy and sell the swap token, but access and capabilities within the system are tied to holding a specific NFT and progressing through a tiered "stage" system.

## 2. Core Concepts

The contract is built around several key concepts that work together:

*   **Token Swapping:** The fundamental feature is the ability to buy `swapToken` with `baseToken` and sell `swapToken` for `baseToken`. The exchange rate is configurable by the contract owner.
*   **NFT-Gated Access:** To interact with the core functions like buying or selling tokens, a user **must** hold a valid key from a whitelisted NFT collection (utilizing the PublicLock interface). This makes the vendor exclusive to members of specific communities.
*   **User Stages:** Users progress through a tier system with three levels: `PLEB`, `HUSTLER`, and `OG`. Each stage has different parameters, offering better terms or higher limits as a user advances. Progression is not automatic and requires users to meet specific criteria.
*   **Points System:** Users earn "points" by performing certain actions, primarily by making qualifying purchases of the swap token. These points are a key requirement for upgrading to a higher stage.
*   **Fuel System:** "Fuel" is another resource users can accumulate. It is primarily gained through a "light up" mechanism, which involves burning a small number of tokens. Fuel is another requirement for stage upgrades and can also be used to temporarily increase a user's daily sell limit.
*   **Fees:** The contract applies fees to both buy and sell transactions. These fees are collected in their respective tokens (`baseToken` for buys, `swapToken` for sells) and can be withdrawn by an authorized address.

## 3. Key Roles & Authorizations

The contract defines several distinct roles with specific permissions:

*   **User (NFT Holder):** A regular user who holds a valid NFT key. They can access the primary functions: `buyTokens`, `sellTokens`, `lightUp`, and `upgradeStage`.
*   **Owner:** The ultimate administrator of the contract. The owner has the highest level of authority and can manage all critical settings, including fee rates, exchange rates, stage configurations, and whitelisted NFT collections. The owner can also pause the contract and appoint a new Steward Council.
*   **Developer (Dev Address):** An authorized address set by the owner. This address is designated to receive the fees collected by the contract when `withdrawFees` or `withdrawETH` is called. The Dev can also update their own address.
*   **Steward Council:** A secondary administrative address (intended to be a multisig wallet) that shares some administrative powers with the owner. It can pause/unpause the contract, providing a layer of security and decentralized control.
*   **Anyone:** Some functions, primarily `view` functions that read data (e.g., `getExchangeRate`, `getStageConfig`), can be called by any address without requiring special permissions.
