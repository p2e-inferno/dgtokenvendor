import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { usePrivyWallet } from "~~/hooks/privy/usePrivyWallet";


export const UserProfile = () => {
  const { address, isConnected, ready } = usePrivyWallet();
  const { logout } = usePrivy();

  const { data: dgTokenSymbol } = useReadContract({
    contractName: "DGToken",
    functionName: "symbol",
    query: { enabled: isConnected && ready },
  });

  const { data: upTokenSymbol } = useReadContract({
    contractName: "DAPPX",
    functionName: "symbol",
    query: { enabled: isConnected && ready },
  });

  const { data: yourDGTokenBalance, isLoading: isLoadingDG } = useReadContract({
    contractName: "DGToken",
    functionName: "balanceOf",
    args: [address],
    query: { enabled: isConnected && ready && !!address },
  });

  const { data: yourUPTokenBalance, isLoading: isLoadingUP } = useReadContract({
    contractName: "DAPPX",
    functionName: "balanceOf",
    args: [address],
    query: { enabled: isConnected && ready && !!address },
  });

  console.log("connectAddress:: ", address);
  console.log("BALL:: ", yourUPTokenBalance);

  const { data: hasValidKey, isLoading: isLoadingKey } = useReadContract({
    contractName: "DGTokenVendor",
    functionName: "hasValidKey",
    args: [address],
    query: { enabled: isConnected && ready && !!address },
  });

  const { data: keyCollection, isLoading: isLoadingCollection } = useReadContract({
    contractName: "DGTokenVendor",
    functionName: "getFirstValidCollection",
    args: [address],
    query: { enabled: isConnected && ready && !!address && !isLoadingKey && !!hasValidKey },
  });

  if (!ready || (isConnected && !address)) {
    return (
      <div className="container mx-auto p-6 flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Please connect your wallet to view profile details.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2 text-2xl mb-4">
            <UserCircleIcon className="h-8 w-8 text-primary" />
            User Profile
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-base-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Account Information</h3>

              <div className="flex items-center gap-2 mb-4">
                <div className="text-base-content/70">Address:</div>
                <Address address={address} />
              </div>

              <div className="mb-2">
                <span className="text-primary font-bold">Status: </span>
                {isLoadingKey ? (
                  <span className="loading loading-dots loading-xs"></span>
                ) : hasValidKey ? (
                  <span className="badge badge-success">Access</span>
                ) : (
                  <span className="badge badge-error">No Access</span>
                )}
              </div>

              {hasValidKey && (
                <div className="mb-2">
                  <span className="text-primary font-bold">Key Collection: </span>
                  {isLoadingCollection ? (
                    <span className="loading loading-dots loading-xs"></span>
                  ) : keyCollection && keyCollection !== "0x0000000000000000000000000000000000000000" ? (
                    <Address address={keyCollection} />
                  ) : (
                    <span className="text-base-content/70 text-sm">Not found</span>
                  )}
                </div>
              )}
            </div>

            <div className="bg-base-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Token Balances</h3>

              <div className="stats stats-vertical shadow w-full">
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <div className="avatar">
                      <div className="w-16 rounded-full bg-secondary text-white flex items-center justify-center text-2xl">
                        {dgTokenSymbol?.[0] || "D"}
                      </div>
                    </div>
                  </div>
                  <div className="stat-title">{dgTokenSymbol || "DGToken"} Balance</div>
                  <div className="stat-value">
                    {isLoadingDG ? (
                      <span className="loading loading-dots loading-xs"></span>
                    ) : (
                      parseFloat(formatEther(yourDGTokenBalance || 0n)).toFixed(4)
                    )}
                  </div>
                  <div className="stat-desc">Digital Game Token</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-primary">
                    <div className="avatar">
                      <div className="w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl">
                        {upTokenSymbol?.[0] || "U"}
                      </div>
                    </div>
                  </div>
                  <div className="stat-title">{upTokenSymbol || "DAPPX"} Balance</div>
                  <div className="stat-value">
                    {isLoadingUP ? (
                      <span className="loading loading-dots loading-xs"></span>
                    ) : (
                      parseFloat(formatEther(yourUPTokenBalance || 0n)).toFixed(4)
                    )}
                  </div>
                  <div className="stat-desc">Unlock Protocol Token</div>
                </div>
              </div>
            </div>

            <div className="bg-base-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Game Statistics</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-base-100 p-4 rounded-lg flex flex-col h-full">
                  <div className="stat-title">Fuel Level</div>
                  <div className="flex-grow flex flex-col items-start justify-center py-2">
                    <div
                      className="radial-progress text-primary"
                      style={{ "--value": 75, "--size": "4rem", "--thickness": "4px" } as any}
                      role="progressbar"
                    >
                      75%
                    </div>
                  </div>
                  <div className="stat-desc mt-2 whitespace-normal">Energy remaining for transactions</div>
                </div>

                <div className="bg-base-100 p-4 rounded-lg flex flex-col h-full">
                  <div className="stat-title">Points</div>
                  <div className="flex-grow flex items-start justify-start">
                    <div className="text-3xl font-bold text-accent">1,250</div>
                  </div>
                  <div className="stat-desc mt-2 whitespace-normal">Earned through transactions</div>
                </div>

                <div className="bg-base-100 p-4 rounded-lg flex flex-col h-full">
                  <div className="stat-title">Stage</div>
                  <div className="flex-grow flex items-start justify-start">
                    <div className="text-2xl font-bold text-secondary">Level 3</div>
                  </div>
                  <div className="stat-desc mt-2 whitespace-normal">Intermediate Trader</div>
                </div>

                <div className="bg-base-100 p-4 rounded-lg flex flex-col h-full">
                  <div className="stat-title">Reputation</div>
                  <div className="flex-grow flex items-start justify-start py-2">
                    <div className="rating rating-md">
                      {[...Array(5)].map((_, i) => (
                        <input
                          key={i}
                          type="radio"
                          name="rating-7"
                          className={`mask mask-star-2 ${i < 3 ? "bg-orange-400" : "bg-base-300"}`}
                          checked={i < 3}
                          readOnly
                          disabled
                        />
                      ))}
                    </div>
                  </div>
                  <div className="stat-desc mt-2 whitespace-normal">Based on transaction history</div>
                </div>
              </div>
            </div>

            <div className="bg-base-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Buy</td>
                      <td>25 {dgTokenSymbol}</td>
                      <td>
                        <span className="badge badge-success">Complete</span>
                      </td>
                      <td>2 min ago</td>
                    </tr>
                    <tr>
                      <td>Sell</td>
                      <td>10 {dgTokenSymbol}</td>
                      <td>
                        <span className="badge badge-success">Complete</span>
                      </td>
                      <td>1 hour ago</td>
                    </tr>
                    <tr>
                      <td>Buy</td>
                      <td>50 {dgTokenSymbol}</td>
                      <td>
                        <span className="badge badge-success">Complete</span>
                      </td>
                      <td>3 hours ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="btn btn-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};