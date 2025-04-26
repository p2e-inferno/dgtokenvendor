"use client";

import { useCallback } from "react";
import { usePrivyWallet } from "./usePrivyWallet";
import { toast } from "react-hot-toast";
import { parseEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Custom hook to create, sign and send transactions with Privy wallets
 * This is compatible with the scaffold-eth useTransactor hook
 */
export const usePrivyTransactor = () => {
  const { activeWallet, ready, isConnected } = usePrivyWallet();
  const { targetNetwork } = useTargetNetwork();

  const sendTransaction = useCallback(
    async (txParams: any) => {
      if (!ready || !isConnected || !activeWallet) {
        toast.error("No wallet connected");
        return;
      }

      const notification = toast.loading("Preparing transaction...");

      try {
        let hash: string | undefined;

        // Handle either contract calls or direct value transfers
        if (txParams.to && txParams.value !== undefined) {
          // This is a simple ETH transfer
          const tx = await activeWallet.sendTransaction({
            to: txParams.to,
            value: typeof txParams.value === "string" ? parseEther(txParams.value) : txParams.value,
            data: txParams.data || "0x",
            chainId: targetNetwork.id,
          });
          hash = tx.hash;
        } else if (txParams.to && txParams.data) {
          // This is a contract interaction with data
          const tx = await activeWallet.sendTransaction({
            to: txParams.to,
            data: txParams.data,
            value: txParams.value || 0n,
            chainId: targetNetwork.id,
          });
          hash = tx.hash;
        } else if (txParams.abi && txParams.functionName) {
          // This is a contract write using scaffold-eth's writeContract style
          // We'd need to encode the function call - this is handled by the privyAdapter

          toast.error("Please use privyAdapter for contract writes");
          toast.dismiss(notification);
          return;
        }

        if (hash) {
          toast.dismiss(notification);
          toast.success(
            <div className="flex flex-col">
              <span>Transaction Sent</span>
              <span className="text-xs">Hash: {hash.slice(0, 10)}...</span>
            </div>,
          );
        }

        return hash;
      } catch (error: any) {
        toast.dismiss(notification);
        console.error("Error sending transaction:", error);
        toast.error(error.message || "Error sending transaction");
        return;
      }
    },
    [activeWallet, isConnected, ready, targetNetwork],
  );

  return sendTransaction;
};
