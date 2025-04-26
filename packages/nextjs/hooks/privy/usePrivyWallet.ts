"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { parseEther } from "viem";
import { type Address } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

// Add this at the top of the file, under the imports
declare global {
  interface Window {
    __PRIVY_EMBED_ENVIRONMENT__?: unknown;
  }
}

/**
 * Check if code is running in a browser environment
 */
const isBrowser = typeof window !== "undefined";

/**
 * Check if the Privy provider is likely available by looking for its global namespace
 * This is a safer way to detect if we're inside a Privy context
 */
const isPrivyAvailable = () => {
  if (!isBrowser) return false;
  return Boolean(window.__PRIVY_EMBED_ENVIRONMENT__);
};

// Create a stable empty privy auth object
const EMPTY_PRIVY_AUTH = {
  user: null,
  ready: true, // Set to true to prevent loading states
  authenticated: false,
  login: async () => {
    console.warn("Privy not available");
  },
  logout: async () => {
    console.warn("Privy not available");
  },
};

// Create a stable empty wallets result
const EMPTY_WALLETS_RESULT = { wallets: [], ready: true }; // Set ready to true to prevent loading states

/**
 * Hook to interact with wallets (Privy or Wagmi) in a way that's compatible with scaffold-eth hooks
 */
export const usePrivyWallet = () => {
  const { targetNetwork } = useTargetNetwork();

  // Only use Privy hooks if the provider is available - memoize this to prevent re-renders
  const privyHooksEnabled = useMemo(() => isPrivyAvailable(), []);

  // Safe access to Privy hooks with stable references
  const privyAuth = useMemo(() => (privyHooksEnabled ? usePrivy() : EMPTY_PRIVY_AUTH), [privyHooksEnabled]);

  const { user, ready: privyReady, authenticated, login, logout } = privyAuth;

  // Only call useWallets if Privy is available, with stable fallback
  const walletsResult = useMemo(() => (privyHooksEnabled ? useWallets() : EMPTY_WALLETS_RESULT), [privyHooksEnabled]);

  const { wallets, ready: walletsReady } = walletsResult;

  const [privyActiveWallet, setPrivyActiveWallet] = useState<any | null>(null);
  const [isPrivyWalletSwitching, setIsPrivyWalletSwitching] = useState(false);

  // Wagmi hooks
  const { address: wagmiAddress, isConnected: isWagmiConnected, chainId: wagmiChainId } = useAccount();
  const { data: wagmiWalletClient } = useWalletClient();

  useEffect(() => {
    if (!privyHooksEnabled || !walletsReady || !wallets.length) {
      setPrivyActiveWallet(null);
      return;
    }
    const embeddedWallet = wallets.find((wallet: any) => wallet.walletClientType === "privy");
    setPrivyActiveWallet(embeddedWallet || wallets[0]);
  }, [wallets, walletsReady, privyHooksEnabled]);

  useEffect(() => {
    const connectToChain = async () => {
      if (!privyHooksEnabled || !privyActiveWallet || !targetNetwork || isPrivyWalletSwitching) return;
      if (privyActiveWallet.chainId === `eip155:${targetNetwork.id}`) return;
      try {
        setIsPrivyWalletSwitching(true);
        await privyActiveWallet.switchChain(targetNetwork.id);
      } catch (error) {
        console.error("Privy: Failed to switch chain:", error);
      } finally {
        setIsPrivyWalletSwitching(false);
      }
    };
    connectToChain();
  }, [privyActiveWallet, targetNetwork, isPrivyWalletSwitching, privyHooksEnabled]);

  // Memoize these values to prevent renders
  const isConnected = useMemo(() => authenticated || isWagmiConnected, [authenticated, isWagmiConnected]);

  const address = useMemo(
    () => (privyActiveWallet?.address as Address) || wagmiAddress,
    [privyActiveWallet, wagmiAddress],
  );

  const chainId = useMemo(() => {
    const pChain = privyActiveWallet?.chainId;
    if (pChain && pChain.startsWith("eip155:")) {
      return parseInt(pChain.split(":")[1], 10);
    }
    return wagmiChainId || targetNetwork.id;
  }, [privyActiveWallet, wagmiChainId, targetNetwork.id]);

  const ready = useMemo(() => {
    // If Privy isn't available, rely solely on wagmi
    if (!privyHooksEnabled) return true; // Return true always for stability

    // Ready if Privy is ready AND (wagmi is ready OR privy wallet exists)
    // This handles cases where Privy is ready but no wallet is connected yet
    return privyReady && (isWagmiConnected || walletsReady) && !isPrivyWalletSwitching;
  }, [privyReady, walletsReady, isWagmiConnected, isPrivyWalletSwitching, privyHooksEnabled]);

  const sendTransaction = useCallback(
    async (options: { to: Address; value?: string; data?: `0x${string}` }) => {
      const { to, value, data } = options;
      const txValue = value ? parseEther(value) : 0n;

      // Prioritize Privy wallet if available and authenticated
      if (authenticated && privyActiveWallet) {
        try {
          if (privyActiveWallet.chainId !== `eip155:${targetNetwork.id}`) {
            await privyActiveWallet.switchChain(targetNetwork.id);
          }
          const tx = await privyActiveWallet.sendTransaction({
            to,
            value: txValue,
            data: data || "0x",
            chainId: targetNetwork.id,
          });
          return tx.hash;
        } catch (error) {
          console.error("Privy Transaction failed:", error);
          throw error;
        }
      }
      // Fallback to Wagmi if connected
      else if (isWagmiConnected && wagmiWalletClient) {
        try {
          const hash = await wagmiWalletClient.sendTransaction({
            to,
            value: txValue,
            data: data,
            chain: targetNetwork,
            account: wagmiWalletClient.account,
          });
          return hash;
        } catch (error) {
          console.error("Wagmi Transaction failed:", error);
          throw error;
        }
      }

      throw new Error("No wallet connected or available to send transaction");
    },
    [authenticated, privyActiveWallet, isWagmiConnected, wagmiWalletClient, targetNetwork],
  );

  const signMessage = useCallback(
    async (message: string) => {
      if (authenticated && privyActiveWallet) {
        try {
          return await privyActiveWallet.signMessage(message);
        } catch (error) {
          console.error("Privy Signing failed:", error);
          throw error;
        }
      } else if (isWagmiConnected && wagmiWalletClient) {
        try {
          return await wagmiWalletClient.signMessage({ message });
        } catch (error) {
          console.error("Wagmi Signing failed:", error);
          throw error;
        }
      }
      throw new Error("No wallet available to sign message");
    },
    [authenticated, privyActiveWallet, isWagmiConnected, wagmiWalletClient],
  );

  const ensureCorrectChain = useCallback(async () => {
    if (authenticated && privyActiveWallet) {
      if (privyActiveWallet.chainId !== `eip155:${targetNetwork.id}`) {
        try {
          await privyActiveWallet.switchChain(targetNetwork.id);
          return true;
        } catch (error) {
          console.error("Privy: Failed to switch chain:", error);
          return false;
        }
      }
      return true;
    }
    // Wagmi handles chain switching via RainbowKit, less need for manual check here
    return isWagmiConnected && wagmiChainId === targetNetwork.id;
  }, [authenticated, privyActiveWallet, targetNetwork, isWagmiConnected, wagmiChainId]);

  // Use memo to stabilize the return value
  return useMemo(
    () => ({
      // Core Auth
      login,
      logout,
      ready,
      isConnected,
      user, // Privy user object

      // Wallet Details
      address,
      chainId,
      wallets: privyHooksEnabled ? wallets : [], // List of Privy wallets
      activeWallet: privyActiveWallet, // The active Privy wallet

      // Actions
      sendTransaction,
      signMessage,
      ensureCorrectChain,

      // Status
      isWalletSwitching: isPrivyWalletSwitching, // Specific to Privy's internal switching
    }),
    [
      login,
      logout,
      ready,
      isConnected,
      user,
      address,
      chainId,
      privyHooksEnabled,
      wallets,
      privyActiveWallet,
      sendTransaction,
      signMessage,
      ensureCorrectChain,
      isPrivyWalletSwitching,
    ],
  );
};
