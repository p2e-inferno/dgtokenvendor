"use client";

import { createPublicClient, http } from "viem";
import { usePrivyWallet } from "~~/hooks/privy/usePrivyWallet";
import scaffoldConfig from "~~/scaffold.config";

/**
 * Adapter for Privy wallet to work with existing scaffold-eth hooks
 * This helper provides compatibility functions
 */
export const createPrivyAdapter = (activeWallet: any, targetNetwork: any) => {
  // Return null if no wallet is active
  if (!activeWallet) return null;

  // Create a public client for the target network
  const publicClient = createPublicClient({
    chain: targetNetwork,
    transport: http(),
  });

  // Create an adapter object that matches the expected API of scaffold-eth hooks
  return {
    // Basic wallet properties
    address: activeWallet.address,
    chainId: targetNetwork.id,

    // Create viemWalletClient API similar to what scaffold-eth expects
    viemWalletClient: {
      account: { address: activeWallet.address },
      chain: targetNetwork,
      transport: http(),

      // Implement minimal transaction methods
      async sendTransaction(tx: any) {
        const result = await activeWallet.sendTransaction({
          to: tx.to,
          value: tx.value || 0n,
          data: tx.data || "0x",
          chainId: targetNetwork.id,
        });
        return result.hash;
      },

      async writeContract(params: any) {
        const { abi, address, functionName, args } = params;
        const data = publicClient.encodeFunctionData({
          abi,
          functionName,
          args,
        });

        const result = await activeWallet.sendTransaction({
          to: address,
          data,
          chainId: targetNetwork.id,
        });

        return result.hash;
      },

      async signMessage(message: { raw?: string; message?: string }) {
        return activeWallet.signMessage({
          message: message.raw || message.message || "",
        });
      },
    },
  };
};

/**
 * React hook to use the Privy adapter in components
 */
export const usePrivyAdapter = () => {
  const { activeWallet } = usePrivyWallet();
  const targetNetwork = scaffoldConfig.targetNetworks[0]; // Default to first network

  return createPrivyAdapter(activeWallet, targetNetwork);
};
