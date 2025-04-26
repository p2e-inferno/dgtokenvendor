"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { parseEther } from "viem";
import { Address } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Hook to interact with Privy wallets in a way that's compatible with scaffold-eth hooks
 */
export const usePrivyWallet = () => {
  const { user, ready: privyReady, authenticated, login, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { targetNetwork } = useTargetNetwork();
  const [activeWallet, setActiveWallet] = useState<any | null>(null);

  // Get the first embedded wallet or the first connected wallet
  useEffect(() => {
    if (!walletsReady || !wallets.length) return;

    // Prefer embedded wallets first for better UX
    const embeddedWallet = wallets.find(wallet => wallet.walletClientType === "privy");
    const firstWallet = embeddedWallet || wallets[0];

    setActiveWallet(firstWallet);
  }, [wallets, walletsReady]);

  // Connect wallet to the target network
  useEffect(() => {
    const connectToChain = async () => {
      if (!activeWallet || !targetNetwork) return;

      try {
        await activeWallet.switchChain({ chainId: targetNetwork.id });
      } catch (error) {
        console.error("Failed to switch chain:", error);
      }
    };

    if (activeWallet) {
      connectToChain();
    }
  }, [activeWallet, targetNetwork]);

  // Send transaction helper compatible with scaffold-eth's useTransactor
  const sendTransaction = useCallback(
    async (options: { to: string; value: string; data?: string }) => {
      if (!activeWallet) {
        throw new Error("No wallet connected");
      }

      try {
        const { to, value, data = "0x" } = options;

        const tx = await activeWallet.sendTransaction({
          to,
          value: parseEther(value),
          data,
          chainId: targetNetwork.id,
        });

        return tx;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
      }
    },
    [activeWallet, targetNetwork],
  );

  const isConnected = useMemo(() => {
    return authenticated && !!activeWallet;
  }, [authenticated, activeWallet]);

  const address = useMemo(() => {
    return (activeWallet?.address as Address) || undefined;
  }, [activeWallet]);

  return {
    login,
    logout,
    ready: privyReady && walletsReady,
    user,
    wallets,
    activeWallet,
    isConnected,
    address,
    sendTransaction,
  };
};
