"use client";

import React, { useMemo, useState } from "react";
import type { NextPage } from "next";
import { ArrowPathIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { BuyTokens } from "~~/components/token-vendor/BuyTokens";
import { NFTCollectionsModal } from "~~/components/token-vendor/NFTCollectionsModal";
import { SellTokens } from "~~/components/token-vendor/SellTokens";
import { UserStats } from "~~/components/token-vendor/UserStats";
import { VendorInfo } from "~~/components/token-vendor/VendorInfo";
import { usePrivyWallet } from "~~/hooks/privy/usePrivyWallet";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const TokenVendor: NextPage = () => {
  const { address, isConnected, ready } = usePrivyWallet();
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);

  // Memoize query config
  const queryConfig = useMemo(
    () => ({
      enabled: ready && !!address,
    }),
    [ready, address],
  );

  const { data: hasValidKey, isLoading: isLoadingKey } = useScaffoldReadContract<"DGTokenVendor", "hasValidKey">({
    contractName: "DGTokenVendor",
    functionName: "hasValidKey",
    args: address ? [address] : undefined,
    query: queryConfig,
  });

  const handleOpenNFTModal = () => {
    setIsNFTModalOpen(true);
  };

  const handleCloseNFTModal = () => {
    setIsNFTModalOpen(false);
  };

  const isPageLoading = !ready || isLoadingKey;

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

        <div className="w-full max-w-4xl mb-8">{isConnected && <UserStats />}</div>

        {hasValidKey ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-10">
              <BuyTokens />
              <SellTokens />
            </div>
          </>
        ) : isConnected ? (
          <div className="alert alert-warning mb-10 max-w-4xl shadow-lg">
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
        ) : (
          <div className="alert alert-info mb-10 max-w-4xl shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Please connect your wallet to use the Token Vendor.</span>
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
