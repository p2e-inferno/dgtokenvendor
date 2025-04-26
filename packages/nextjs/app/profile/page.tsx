"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import * as FaIcons from "react-icons/fa";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  LinkIcon,
  UserCircleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { UserProfile } from "~~/components/token-vendor/UserProfile";
import { usePrivyWallet } from "~~/hooks/privy/usePrivyWallet";

// Define types for linked accounts
type LinkedAccount = {
  type: string;
  id: string;
  address?: string;
  email?: string;
  username?: string;
  walletClientType?: string;
};

export default function ProfilePage() {
  const { ready, authenticated, login, user, linkWallet, linkEmail, linkTwitter, linkFarcaster } = usePrivy();
  const { address, isConnected } = usePrivyWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "socials" | "wallet">("profile");

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
      if (user?.linkedAccounts) {
        setLinkedAccounts(user.linkedAccounts as LinkedAccount[]);
      }
    }
  }, [ready, user]);

  // Filter accounts by type
  const wallets = linkedAccounts.filter(account => account.type === "wallet");
  const socialAccounts = linkedAccounts.filter(account => account.type !== "wallet" && account.type !== "email");
  const emails = linkedAccounts.filter(account => account.type === "email");

  // Check what accounts are linked
  const hasTwitter = socialAccounts.some(account => account.type === "twitter");
  const hasFarcaster = socialAccounts.some(account => account.type === "farcaster");

  // Twitter icon with styling
  const TwitterIcon = () => (
    <span className="text-blue-400 mr-2">
      <FaIcons.FaTwitter />
    </span>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-base-content/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          <p className="text-base-content/70 mb-8">Please connect your wallet to view your profile</p>
          <button onClick={() => login()} className="btn btn-primary">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-16 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="btn btn-ghost btn-sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-bold ml-4">Your Profile</h1>
        </div>

        {/* Tab Navigation */}
        <div className="tabs tabs-boxed mb-6">
          <a className={`tab ${activeTab === "profile" ? "tab-active" : ""}`} onClick={() => setActiveTab("profile")}>
            <UserCircleIcon className="h-4 w-4 mr-2" />
            Game Profile
          </a>
          <a className={`tab ${activeTab === "socials" ? "tab-active" : ""}`} onClick={() => setActiveTab("socials")}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Linked Accounts
          </a>
          <a className={`tab ${activeTab === "wallet" ? "tab-active" : ""}`} onClick={() => setActiveTab("wallet")}>
            <WalletIcon className="h-4 w-4 mr-2" />
            Wallet Details
          </a>
        </div>

        {/* Conditional Tab Contents */}
        {activeTab === "profile" && address && (
          <div className="animate-fadeIn">
            <UserProfile />
          </div>
        )}

        {activeTab === "socials" && (
          <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Social Accounts Section */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-accent mb-4 flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2 text-accent" />
                  Social Accounts
                </h2>

                {socialAccounts.length === 0 ? (
                  <p className="text-base-content/70 mb-4">No social accounts connected</p>
                ) : (
                  <ul className="mb-4 space-y-3">
                    {socialAccounts.map((social, index) => (
                      <li
                        key={index}
                        className="flex items-center p-3 bg-base-200 rounded-lg transition-all hover:bg-base-300"
                      >
                        <CheckCircleIcon className="h-5 w-5 text-success mr-3" />
                        <span className="flex items-center">
                          {social.type === "twitter" ? (
                            <>
                              <span className="text-blue-400 mr-2">
                                <FaIcons.FaTwitter />
                              </span>
                              <span className="font-medium">Twitter:</span>
                            </>
                          ) : (
                            <>
                              <span className="text-purple-500 font-bold mr-2">fc</span>
                              <span className="font-medium">Farcaster:</span>
                            </>
                          )}
                          <span className="ml-2 font-semibold">{social.username || social.id}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col gap-2">
                  {!hasTwitter && (
                    <button onClick={() => linkTwitter()} className="btn btn-outline btn-accent btn-sm">
                      <span className="mr-2">
                        <FaIcons.FaTwitter />
                      </span>
                      Link Twitter
                    </button>
                  )}
                  {!hasFarcaster && (
                    <button onClick={() => linkFarcaster()} className="btn btn-outline btn-accent btn-sm">
                      <span className="font-bold mr-1">fc</span>
                      Link Farcaster
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Email Section */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-accent mb-4 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-accent" />
                  Email Addresses
                </h2>

                {emails.length === 0 ? (
                  <p className="text-base-content/70 mb-4">No email addresses connected</p>
                ) : (
                  <ul className="mb-4 space-y-3">
                    {emails.map((email, index) => (
                      <li
                        key={index}
                        className="flex items-center p-3 bg-base-200 rounded-lg transition-all hover:bg-base-300"
                      >
                        <CheckCircleIcon className="h-5 w-5 text-success mr-3" />
                        <span className="font-mono">{email.email}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button onClick={() => linkEmail()} className="btn btn-outline btn-accent btn-sm">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Link Email Address
                </button>
              </div>
            </div>

            {/* Wallets Section */}
            <div className="card bg-base-100 shadow-xl md:col-span-2">
              <div className="card-body">
                <h2 className="card-title text-accent mb-4 flex items-center">
                  <WalletIcon className="h-5 w-5 mr-2 text-accent" />
                  Connected Wallets
                </h2>

                {wallets.length === 0 ? (
                  <p className="text-base-content/70 mb-4">No wallets connected</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                    {wallets.map((wallet, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-base-200 rounded-lg transition-all hover:bg-base-300"
                      >
                        <CheckCircleIcon className="h-5 w-5 text-success mr-3" />
                        <div>
                          <span className="font-mono text-sm block">
                            {wallet.address?.substring(0, 6)}...
                            {wallet.address?.substring((wallet.address?.length || 0) - 4)}
                          </span>
                          <span className="text-xs text-base-content/70">
                            {wallet.walletClientType === "privy" ? "Embedded Wallet" : "External Wallet"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => linkWallet()} className="btn btn-outline btn-accent btn-sm">
                  <WalletIcon className="h-4 w-4 mr-2" />
                  Link Another Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "wallet" && address && (
          <div className="animate-fadeIn card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-primary mb-6 flex items-center">
                <WalletIcon className="h-6 w-6 mr-2 text-primary" />
                Active Wallet Details
              </h2>

              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div className="stat">
                  <div className="stat-title">Wallet Type</div>
                  <div className="stat-value text-lg">
                    {isConnected
                      ? wallets.find(w => w.address?.toLowerCase() === address?.toLowerCase())?.walletClientType ===
                        "privy"
                        ? "Embedded Wallet"
                        : "External Wallet"
                      : "Not connected"}
                  </div>
                  <div className="stat-desc">Managed by Privy</div>
                </div>

                <div className="stat">
                  <div className="stat-title">Address</div>
                  <div className="stat-value text-lg font-mono break-all">
                    {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                  </div>
                  <div className="stat-desc">Currently active wallet</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <div className="avatar">
                      <div className="w-16 rounded-full bg-secondary flex items-center justify-center">
                        <WalletIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="stat-title">Status</div>
                  <div className="stat-value text-lg">
                    <span className="badge badge-success">Active</span>
                  </div>
                  <div className="stat-desc">Ready for transactions</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
