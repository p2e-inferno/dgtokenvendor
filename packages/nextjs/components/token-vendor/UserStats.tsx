import React from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const UserStats = () => {
  const { address } = useAccount();

  const { data: dgTokenSymbol } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "symbol",
  });

  const { data: upTokenSymbol } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "symbol",
  });

  const { data: dgTokenName } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "name",
  });

  const { data: yourDGTokenBalance } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: yourUPTokenBalance } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: hasValidKey } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "hasValidKey",
    args: [address],
  });

  return (
    <div className="card bg-base-100 shadow-xl border-2 border-accent rounded-xl w-full">
      <div className="card-body flex flex-col items-center">
        <h2 className="card-title text-primary">Your Account</h2>

        <div className="stats stats-vertical lg:stats-horizontal w-full">
          <div className="stat">
            <div className="stat-title">Status</div>
            <div className="stat-value flex items-center gap-2">
              {hasValidKey ? (
                <>
                  <span className="text-success text-lg">Access</span>
                  <span className="text-2xl">✅</span>
                </>
              ) : (
                <>
                  <span className="text-error text-lg">No Access</span>
                  <span className="text-2xl">⚠️</span>
                </>
              )}
            </div>
            <div className="stat-desc">
              {hasValidKey ? "You can buy and sell tokens" : "You need an NFT key to use the vendor"}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">{dgTokenName || "DG Token"} Balance</div>
            <div className="stat-value text-secondary">
              {parseFloat(formatEther(yourDGTokenBalance || 0n)).toFixed(4)}
            </div>
            <div className="stat-desc">
              <span className="font-bold">{dgTokenSymbol}</span>
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">UP Token Balance</div>
            <div className="stat-value text-accent">{parseFloat(formatEther(yourUPTokenBalance || 0n)).toFixed(4)}</div>
            <div className="stat-desc">
              <span className="font-bold">{upTokenSymbol}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
