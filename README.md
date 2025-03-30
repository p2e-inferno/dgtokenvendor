# DGToken Vendor System

This project implements a token vendor system with advanced access control and NFT-based authorization.

## Overview

The system consists of several smart contracts:

1. **DGToken**: A base ERC20 token with advanced access control
2. **SwapToken**: A secondary ERC20 token that can be traded with the base token
3. **DGTokenVendor**: A token exchange platform that allows holders of specific NFTs to trade between tokens
4. **MockNFT**: A simple NFT contract for testing

## Key Features

- **NFT-Based Access**: Only holders of NFTs from whitelisted collections can use the vendor
- **Fee Collection**: The vendor charges a 1% fee on all transactions
- **Role-Based Access Control**: Uses OpenZeppelin's AccessControlDefaultAdminRules
- **Rate Controls**: Exchange rate can only be changed once every 90 days
- **Fee Separation**: Fees are tracked separately from token balances and can be withdrawn independently

## Smart Contract Roles

- **DEFAULT_ADMIN_ROLE**: Full administrative access
- **VENDOR_MANAGER_ROLE**: Can manage whitelisted collections and exchange rates

## Usage

### As an Admin

1. Deploy the contracts using the deployment script
2. Manage whitelisted NFT collections using `addWhitelistedCollection`
3. Update exchange rates (max once per 90 days) using `setExchangeRate`
4. Withdraw collected fees with `withdrawFees`

### As a User

1. Obtain one of the whitelisted NFTs
2. Approve the vendor contract to spend your tokens
3. Use `buyTokens` to purchase swap tokens with base tokens
4. Use `sellTokens` to sell swap tokens for base tokens

## Configuration

- Maximum whitelist size: 10 collections
- Fee percentage: 1%
- Rate change cooldown: 90 days

## Development

The contracts are built with Solidity 0.8.20 and use OpenZeppelin contracts for security best practices.

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy contracts
npx hardhat deploy

# Run tests
npx hardhat test
```

## Security Features

- Custom error definitions for better debugging
- Role-based access control for administrative functions
- Fee tracking system to prevent improper token withdrawals
- NFT validation checks for each transaction
