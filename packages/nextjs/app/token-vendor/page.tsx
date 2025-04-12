"use client";

import React, { useState } from "react";
import type { NextPage } from "next";
import { Toaster } from "react-hot-toast";
import { useAccount } from "wagmi";
import { ArrowPathIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { BuyTokens } from "~~/components/token-vendor/BuyTokens";
import { NFTCollectionsModal } from "~~/components/token-vendor/NFTCollectionsModal";
import { SellTokens } from "~~/components/token-vendor/SellTokens";
import { UserStats } from "~~/components/token-vendor/UserStats";
import { VendorInfo } from "~~/components/token-vendor/VendorInfo";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const TokenVendor: NextPage = () => {
  const { address } = useAccount();
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);

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
      <Toaster />

      <div className="flex flex-col items-center">
        <div className="text-center mb-8 max-w-2xl">
          <h1 className="text-4xl font-bold text-primary mb-4">Token Vendor</h1>
          <p className="text-base-content/70 text-lg">
            Buy and sell digital tokens using our secure token vendor. Verified users can exchange tokens at competitive
            rates.
          </p>
        </div>

        <div className="w-full max-w-4xl mb-8">
          <UserStats />
        </div>

        {hasValidKey ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-10">
            <BuyTokens />
            <SellTokens />
          </div>
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
