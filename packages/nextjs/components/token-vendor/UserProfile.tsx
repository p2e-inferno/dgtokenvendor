import React from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

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
    functionName: "getFirstValidKeyCollection",
    args: [address],
  });

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
                {hasValidKey ? (
                  <span className="badge badge-success">Verified User</span>
                ) : (
                  <span className="badge badge-error">Unverified</span>
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
                      <div className="w-16 rounded-full bg-secondary text-white flex items-center justify-center text-2xl">
                        {dgTokenSymbol?.[0] || "D"}
                      </div>
                    </div>
                  </div>
                  <div className="stat-title">{dgTokenSymbol} Balance</div>
                  <div className="stat-value">{parseFloat(formatEther(yourDGTokenBalance || 0n)).toFixed(4)}</div>
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
                  <div className="stat-title">{upTokenSymbol} Balance</div>
                  <div className="stat-value">{parseFloat(formatEther(yourUPTokenBalance || 0n)).toFixed(4)}</div>
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
            <button className="btn btn-primary">Export Data</button>
            <button className="btn btn-outline">Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};
