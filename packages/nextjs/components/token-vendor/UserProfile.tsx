import React from "react";
import Image from "next/image";
import { RecentActivity } from "./RecentActivity";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { UserStage } from "~~/types/dgtoken-vendor";

const stageLabels: Record<UserStage, string> = {
  [UserStage.PLEB]: "Pleb",
  [UserStage.HUSTLER]: "Hustler",
  [UserStage.OG]: "OG Trader",
};

export const UserProfile = () => {
  const { address } = useAccount();

  const { data: dgTokenSymbol } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "symbol",
  });

  const { data: upTokenSymbol } = useScaffoldReadContract({
    contractName: "UnlockProtocolToken",
    functionName: "symbol",
  });

  const { data: yourDGTokenBalance } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: yourUPTokenBalance } = useScaffoldReadContract({
    contractName: "UnlockProtocolToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: hasValidKey } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "hasValidKey",
    args: [address],
  });

  const { data: keyCollection } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getFirstValidCollection",
    args: [address],
  });

  const { data: userState } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getUserState",
    args: [address],
  });

  return (
    <div className="container mx-auto lg:p-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2 text-2xl mb-4">
            <UserCircleIcon className="h-8 w-8 text-primary" />
            User Profile
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-base-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Account Information</h3>

              <div className="flex flex-col lg:flex-row gap-2 mb-4">
                <div className="text-base-content/70">Address:</div>
                <Address address={address} />
              </div>

              <div className="mb-2">
                <span className="text-primary font-bold">Status: </span>
                {hasValidKey ? (
                  <span className="badge badge-success">Access</span>
                ) : (
                  <span className="badge badge-error">No Access</span>
                )}
              </div>

              {hasValidKey && keyCollection && keyCollection !== "0x0000000000000000000000000000000000000000" && (
                <div className="mb-2">
                  <span className="text-primary font-bold">Key Collection: </span>
                  <Address address={keyCollection} />
                </div>
              )}
            </div>

            <div className="bg-base-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Token Balances</h3>

              <div className="stats stats-vertical shadow w-full">
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full text-white flex items-center justify-center relative overflow-hidden">
                        <Image
                          src="/dgToken_logo.png"
                          alt={`${dgTokenSymbol || "DGToken"} logo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="stat-title">{dgTokenSymbol} Balance</div>
                  <div className="stat-value">{parseFloat(formatEther(yourDGTokenBalance || 0n)).toFixed(2)}</div>
                  <div className="stat-desc">DreadGang Token</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-primary">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full text-white flex items-center justify-center relative overflow-hidden">
                        <Image
                          src="/upToken_logo.png"
                          alt={`${upTokenSymbol || "UPToken"} logo`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="stat-title">{upTokenSymbol} Balance</div>
                  <div className="stat-value">{parseFloat(formatEther(yourUPTokenBalance || 0n)).toFixed(2)}</div>
                  <div className="stat-desc">Unlock Protocol Token</div>
                </div>
              </div>
            </div>

            <div className="bg-base-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Game Statistics</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-base-100 p-4 rounded-lg flex flex-col h-full justify-between">
                  <div className="stat-title">Fuel Level</div>
                  <div className="flex-grow flex flex-col items-start justify-center py-2">
                    <div
                      className="radial-progress text-primary"
                      style={
                        {
                          "--value": userState?.fuel ? Number(userState.fuel) : 0,
                          "--size": "4rem",
                          "--thickness": "4px",
                        } as any
                      }
                      role="progressbar"
                    >
                      {userState?.fuel ? Number(userState.fuel) : 0}%
                    </div>
                  </div>
                  <div className="stat-desc mt-2 whitespace-normal">Energy remaining for transactions</div>
                </div>

                <div className="bg-base-100 p-4 rounded-lg flex flex-col h-full justify-between">
                  <div className="stat-title">Points</div>
                  <div className="flex-grow flex items-center justify-start">
                    <div className="text-3xl font-bold text-accent">
                      {userState?.points ? Number(userState.points).toLocaleString() : "0"}
                    </div>
                  </div>
                  <div className="stat-desc mt-2 whitespace-normal">Earned through transactions</div>
                </div>

                <div className="bg-base-100 p-4 rounded-lg flex flex-col h-full justify-between">
                  <div className="stat-title">Stage</div>
                  <div className="flex-grow flex items-center justify-start">
                    <div className="text-2xl font-bold text-secondary">
                      {userState?.stage !== undefined && stageLabels[userState.stage as UserStage]
                        ? stageLabels[userState.stage as UserStage]
                        : "N/A"}
                    </div>
                  </div>
                  <div className="stat-desc mt-2 whitespace-normal">
                    {userState?.stage !== undefined && stageLabels[userState.stage as UserStage]
                      ? `Current Player Level: ${stageLabels[userState.stage as UserStage]}`
                      : "Loading..."}
                  </div>
                </div>

                <div className="bg-base-100 p-4 rounded-lg flex flex-col h-full justify-between">
                  <div className="stat-title">Reputation</div>
                  <div className="flex-grow flex items-center justify-start">
                    <div className="text-sm text-base-content/70">Coming Soon</div>
                  </div>
                  <div className="stat-desc mt-2 whitespace-normal">Based on transaction history</div>
                </div>
              </div>
            </div>

            <div className="bg-base-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>

              <RecentActivity userAddress={address} dgTokenSymbol={dgTokenSymbol as string | undefined} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
