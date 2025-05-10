# DreadGang Token Vendor

Welcome to the DreadGang Token Vendor – where NFTs unlock a new world of onchain exploration, token trading, progression, and gamified DeFi. This project is more than a token swap: it's a smart contract-powered ecosystem where your NFT is your ticket to exclusive events, experiences, trading, leveling up, and earning rewards.

## 🚀 What is DGToken Vendor?

DGToken Vendor is a next-generation token exchange platform built on Ethereum. It combines:

- **NFT-gated access**: Only holders of whitelisted NFTs can trade.
- **Multi-stage user progression**: Users level up from PLEB to HUSTLER to OG, earning points and fuel as they trade.
- **Gamified mechanics**: Burn tokens to gain fuel, hit thresholds to earn points, and upgrade your stage for better perks.
- **Transparent, secure fees**: All fees are tracked and can be withdrawn by authorized admins.
- **Robust admin controls**: Fine-tune rates, fees, and whitelists with built-in cooldowns for safety.

## 🏗️ System Architecture

- **BaseToken**: The primary ERC20 token (UnlockProtocolToken - UP) for trading.
- **DGToken**: The swap ERC20 token ("DreadGang Token").
- **DGTokenVendor**: The heart of the system – a smart contract that manages trading, progression, and access.
- **MockNFT**: A simple NFT contract for testing and local development.

## 🌟 Key Features

- **NFT-Based Access**: Only whitelisted NFT holders can buy/sell tokens.
- **User Progression**: Earn points and fuel as you trade, burn tokens to "light up," and upgrade your stage for higher limits.
- **Fee System**: 1% buy fee, 2% sell fee (default, configurable by admin). Fees are separated and withdrawable.
- **Admin Controls**: Manage whitelists, rates, fees, and system addresses. All sensitive changes have cooldowns for security.
- **Security**: Custom errors, reentrancy protection, pausable contract, and OpenZeppelin best practices.

## 👤 User Journey

1. **Get a Whitelisted NFT**: Mint or acquire an NFT from an approved collection.
2. **Connect & Approve**: Approve the vendor contract to spend your tokens.
3. **Trade**: Use `buyTokens` to purchase swap tokens, or `sellTokens` to convert back.
4. **Progress**: Hit trading thresholds to earn points, burn tokens to gain fuel, and upgrade your stage for better trading limits.

## 🛠️ Admin Journey

- **Whitelist Management**: Add NFT collections with `initializeWhitelistedCollections` (max 10).
- **Rates & Fees**: Adjust with `setExchangeRate` and `setFeeRates` (subject to cooldowns).
- **Withdrawals**: Use `withdrawFees` and `withdrawETH` to collect protocol fees.
- **Stage & System Config**: Fine-tune user progression and cooldowns with `setStageConfig` and `setCooldownConfig`.

## ⚡ Quick Start

### Prerequisites

- Node.js & Yarn
- [Hardhat](https://hardhat.org/) for smart contract dev

### Install & Deploy

```bash
# Install all dependencies
yarn install

# Deploy contracts (from packages/hardhat)
yarn deploy

# Run the frontend (from packages/nextjs)
yarn start
```

### Message Signing (for contract admin)

See `packages/hardhat/README-sign-message.md` for secure message signing instructions.

## 🤝 Contributing

We welcome your ideas, code, and feedback! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, coding standards, and how to get involved.

## 🛡️ Security & Disclaimer

This project is for **educational and informational purposes only**. While we follow best practices, no guarantees are made regarding security or fitness for production. **Always audit before deploying to production.**

---

Join the DreadGang movement – where your NFT is your passport to a new era of onchain exploration!
