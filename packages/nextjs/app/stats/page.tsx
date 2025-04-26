"use client";

import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { UserProfile } from "~~/components/token-vendor/UserProfile";
import { usePrivyWallet } from "~~/hooks/privy/usePrivyWallet";

export default function StatsPage() {
  const { address, isConnected, ready } = usePrivyWallet();
  const { login } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-base-content/70">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">User Statistics</h1>
        <p className="text-xl mb-8">View your account information, token balances, and game statistics.</p>

        {!isConnected ? (
          <div className="space-y-4">
            <div className="bg-warning/20 border border-warning text-warning px-4 py-3 rounded relative mb-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                <div>
                  <p className="font-bold">Wallet not connected</p>
                  <p>Please connect your wallet to view your statistics.</p>
                </div>
              </div>
            </div>
            <button onClick={() => login()} className="btn btn-primary">
              Connect Wallet
            </button>
          </div>
        ) : (
          <UserProfile />
        )}
      </div>
    </div>
  );
}
