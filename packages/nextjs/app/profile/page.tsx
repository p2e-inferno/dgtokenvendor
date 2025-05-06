"use client";

import React from "react";
import type { NextPage } from "next";
import { Toaster } from "react-hot-toast";
import { useAccount } from "wagmi";
import { ProfilePageSkeleton } from "~~/components/skeletons/ProfilePageSkeleton";
import { UserProfile } from "~~/components/token-vendor/UserProfile";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const ProfilePage: NextPage = () => {
  const { address, isConnected, status: accountStatus } = useAccount();

  const { isLoading: isLoadingHasValidKey } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "hasValidKey",
    args: [address],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Determine initial loading state based on account connection status
  const isConnecting = accountStatus === "connecting" || accountStatus === "reconnecting";

  return (
    <div className="container mx-auto px-4 pt-10 pb-16">
      <Toaster />

      {isConnecting ? (
        <ProfilePageSkeleton />
      ) : !isConnected ? (
        <div className="flex flex-col items-center min-h-[60vh] justify-center">
          {" "}
          {/* Wrapper for centering */}
          <div className="alert alert-warning mt-10 mb-10 max-w-md text-center shadow-lg">
            <div>
              <h3 className="font-bold text-lg">Connect Your Wallet</h3>
              <div className="text-md py-2">Please connect your wallet to view your profile.</div>
            </div>
          </div>
        </div>
      ) : isLoadingHasValidKey ? (
        <ProfilePageSkeleton />
      ) : (
        <div className="flex flex-col items-center">
          <div className="text-center mb-8 max-w-2xl">
            <h1 className="text-4xl font-bold text-primary mb-4">User Profile</h1>
            <p className="text-base-content/70 text-lg">View your game profile, tokens, and statistics.</p>
          </div>
          <div className="w-full max-w-4xl">
            <UserProfile />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
