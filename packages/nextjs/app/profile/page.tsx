"use client";

import React from "react";
import type { NextPage } from "next";
import { Toaster } from "react-hot-toast";
import { useAccount } from "wagmi";
import { UserProfile } from "~~/components/token-vendor/UserProfile";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const ProfilePage: NextPage = () => {
  const { address, isConnected } = useAccount();

  const { data: hasValidKey } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "hasValidKey",
    args: [address],
  });

  return (
    <div className="container mx-auto px-4 pt-10 pb-16">
      <Toaster />

      <div className="flex flex-col items-center">
        <div className="text-center mb-8 max-w-2xl">
          <h1 className="text-4xl font-bold text-primary mb-4">User Profile</h1>
          <p className="text-base-content/70 text-lg">View your game profile, tokens, and statistics.</p>
        </div>

        {!isConnected ? (
          <div className="alert alert-warning mb-10 max-w-4xl">
            <div>
              <h3 className="font-bold">Connect Your Wallet</h3>
              <div className="text-sm">Please connect your wallet to view your profile.</div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <UserProfile />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
