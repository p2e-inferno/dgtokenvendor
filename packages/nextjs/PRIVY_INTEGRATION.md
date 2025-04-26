# Privy Integration for DGToken Vendor

This document explains how to set up and use the Privy integration in the DGToken Vendor application.

## Overview

Privy provides a frictionless wallet experience for your users by:

1. Creating embedded wallets for users who don't have a wallet
2. Removing confirmation popups for approvals and transactions
3. Providing a seamless authentication experience

## Setup Instructions

### 1. Create a Privy App

1. Go to [Privy Dashboard](https://console.privy.io/)
2. Create a new application
3. Copy your Privy App ID

### 2. Configure Environment Variables

Create a `.env.local` file in the `packages/nextjs` directory with the following content:

```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

Replace `your-privy-app-id` with the App ID from the Privy Dashboard.

## Usage

The integration provides several components and hooks for interacting with Privy:

### Components

- `PrivyProvider`: Wraps the app and provides Privy authentication and wallet capabilities
- `PrivyConnectButton`: A custom connect button styled to match the existing UI

### Hooks

- `usePrivyWallet`: Hook to interact with Privy wallets
- `usePrivyTransactor`: Hook for sending transactions without confirmation popups
- `usePrivyTokenTransaction`: Hook for token transactions (approve, buy, sell)

## User Flow

1. Users connect their wallet using the Privy Connect Button in the header
2. If they don't have a wallet, Privy creates an embedded wallet for them
3. Users can interact with the token vendor with reduced friction:
   - No confirmation popups for approvals
   - No confirmation popups for transactions
   - Seamless network switching

## Technical Details

### Integration with Scaffold-ETH

The Privy integration is designed to work alongside the existing Scaffold-ETH components:

1. The `PrivyProvider` wraps the entire application
2. The `PrivyConnectButton` replaces the RainbowKit connect button
3. Custom hooks provide compatibility with the existing scaffold-eth hooks

### Files Added

- `components/privy/PrivyProvider.tsx`: Custom Privy provider
- `components/privy/PrivyConnectButton.tsx`: Custom connect button
- `hooks/privy/usePrivyWallet.ts`: Hook for wallet integration
- `hooks/privy/usePrivyTransactor.tsx`: Hook for transaction handling
- `hooks/usePrivyTokenTransaction.ts`: Hook for token transactions
- `services/privy/privyAdapter.ts`: Adapter for scaffold-eth compatibility

## Troubleshooting

- If you encounter issues with the embedded wallet, ensure your Privy App ID is correctly set in the `.env.local` file
- For transaction issues, check the browser console for detailed error messages
- For network-related issues, make sure the supported chains in the Privy provider match your target networks

## Resources

- [Privy Documentation](https://docs.privy.io/)
- [Privy Dashboard](https://console.privy.io/)
- [Privy Discord Community](https://discord.gg/privy)
