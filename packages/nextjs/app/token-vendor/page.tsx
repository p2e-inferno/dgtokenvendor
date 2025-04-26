"use client";

import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowPathIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { BuyTokens } from "~~/components/token-vendor/BuyTokens";
import { NFTCollectionsModal } from "~~/components/token-vendor/NFTCollectionsModal";
import { SellTokens } from "~~/components/token-vendor/SellTokens";
import { UserStats } from "~~/components/token-vendor/UserStats";
import { VendorInfo } from "~~/components/token-vendor/VendorInfo";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// Lazy load Privy components to avoid requiring them during server-side rendering
const LazyPrivyBuyTokens = React.lazy(() =>
  import("~~/components/token-vendor/PrivyBuyTokens").then(module => ({
    default: module.PrivyBuyTokens,
  })),
);

// Lazy load Privy hooks
const usePrivyWallet = async () => {
  if (typeof window === "undefined") return { address: undefined, isConnected: false };

  try {
    const { usePrivyWallet: hook } = await import("~~/hooks/privy");
    return hook();
  } catch (error) {
    console.warn("Privy hooks not available:", error);
    return { address: undefined, isConnected: false };
  }
};

const TokenVendor: NextPage = () => {
  const { address: wagmiAddress } = useAccount();
  const [privyAddress, setPrivyAddress] = useState<string | undefined>();
  const [isPrivyConnected, setIsPrivyConnected] = useState(false);
  const [isPrivyAvailable, setIsPrivyAvailable] = useState(false);
  const address = privyAddress || wagmiAddress;
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);

  // Load Privy wallet info if available
  useEffect(() => {
    const loadPrivyWallet = async () => {
      try {
        // Check if Privy is available
        const { usePrivyWallet: hookFn } = await import("~~/hooks/privy");

        // If we get here, Privy is available
        setIsPrivyAvailable(true);

        // Get the current wallet info
        const { address, isConnected } = hookFn();
        setPrivyAddress(address);
        setIsPrivyConnected(isConnected);
      } catch (error) {
        console.warn("Privy wallet not available:", error);
        setIsPrivyAvailable(false);
      }
    };

    loadPrivyWallet();
  }, []);

  const { data: hasValidKey } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "hasValidKey",
    args: [address],
  });

  const { data: yourSwapTokenBalance } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "balanceOf",
    args: [address],
  });

  const handleOpenNFTModal = () => {
    setIsNFTModalOpen(true);
  };

  const handleCloseNFTModal = () => {
    setIsNFTModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 pt-10 pb-16">
      <div className="flex flex-col items-center">
        <div className="text-center mb-8 max-w-2xl">
          <h1 className="text-4xl font-bold text-primary mb-4">DGToken Vendor</h1>
          <p className="text-base-content/70 text-lg">
            Buy and sell digital tokens using our secure token vendor. Users with <strong>Access</strong> can exchange
            tokens at the current vendor rate.
          </p>
        </div>

        <div className="w-full max-w-4xl mb-8">
          <UserStats />
        </div>

        {hasValidKey ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-10">
              {isPrivyConnected && isPrivyAvailable ? (
                <React.Suspense
                  fallback={<div className="card bg-base-100 shadow-xl border border-primary/20 p-4">Loading...</div>}
                >
                  <LazyPrivyBuyTokens />
                </React.Suspense>
              ) : (
                <BuyTokens />
              )}
              <SellTokens />
            </div>
            {isPrivyAvailable && !isPrivyConnected && (
              <div className="alert alert-info mb-10 max-w-4xl">
                <div>
                  <h3 className="font-bold">Frictionless Experience Available</h3>
                  <div className="text-sm">
                    Connect with Privy in the header to enjoy a smoother transaction experience with fewer confirmation
                    popups.
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-warning mb-10 max-w-4xl">
            <QuestionMarkCircleIcon className="h-6 w-6" />
            <div>
              <h3 className="font-bold">Access Required</h3>
              <div className="text-sm">
                You need a valid NFT key to use the token vendor. Please acquire a key from one of the whitelisted
                collections.
              </div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={handleOpenNFTModal}>
              Learn How
            </button>
          </div>
        )}

        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-accent">Vendor Details</h2>
            <button className="btn btn-circle btn-sm">
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>

          <VendorInfo />
        </div>
      </div>

      <NFTCollectionsModal isOpen={isNFTModalOpen} onClose={handleCloseNFTModal} />
    </div>
  );
};

export default TokenVendor;
