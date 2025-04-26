"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CurrencyDollarIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { FireIcon, TrophyIcon } from "@heroicons/react/24/solid";

const Home: NextPage = () => {
  const { address } = useAccount();

  return (
    <div className="container mx-auto px-4 pt-10 pb-16">
      <div className="flex flex-col items-center">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-5xl font-bold text-primary mb-4">DG Token Vendor</h1>
          <p className="text-lg text-base-content/70">
            Buy, sell, and manage digital game tokens using our secure token vendor platform. Connect your wallet to get
            started!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
          {/* Token Vendor Card */}
          <Link
            href="/token-vendor"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all border border-primary/20 hover:border-primary/50"
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h2 className="card-title text-primary">DGToken Vendor</h2>
                <CurrencyDollarIcon className="h-8 w-8 text-primary" />
              </div>
              <p className="text-base-content/70">
                Buy and sell digital tokens at competitive rates. Exchange your Unlock Protocol tokens for DG tokens.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-sm">Visit Vendor</button>
              </div>
            </div>
          </Link>

          {/* User Profile Card */}
          <Link
            href="/profile"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all border border-accent/20 hover:border-accent/50"
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h2 className="card-title text-accent">User Profile</h2>
                <UserCircleIcon className="h-8 w-8 text-accent" />
              </div>
              <p className="text-base-content/70">
                View your game profile, token balances, and transaction history. Check your verification status.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-accent btn-sm">View Profile</button>
              </div>
            </div>
          </Link>

          {/* Power Up Card - replacing Debug Contracts */}
          <Link
            href="/token-vendor/power-up"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all border border-secondary/20 hover:border-secondary/50"
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h2 className="card-title text-secondary">Power Up</h2>
                <div className="flex">
                  <FireIcon className="h-8 w-8 text-orange-500" />
                  <TrophyIcon className="h-8 w-8 text-yellow-500 -ml-2" />
                </div>
              </div>
              <p className="text-base-content/70">
                Light up your fuel gauge and upgrade your trader status. Ascend from PLEB to HUSTLER to OG with
                strategic actions.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-secondary btn-sm">Power Up</button>
              </div>
            </div>
          </Link>
        </div>

        {address ? (
          <div className="alert alert-info max-w-lg shadow-lg">
            <div>
              <h3 className="font-bold">Connected!</h3>
              <div className="text-sm">
                You&apos;re now connected to the DG Token Vendor. Explore the platform using the navigation above.
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning max-w-lg shadow-lg">
            <div>
              <h3 className="font-bold">Connect Wallet</h3>
              <div className="text-sm">Connect your wallet using the button in the header to access all features.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
