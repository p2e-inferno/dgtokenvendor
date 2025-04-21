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
    contractName: "UnlockProtocolToken",
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
    contractName: "UnlockProtocolToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: hasValidKey } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "hasValidKey",
    args: [address],
  });

  return (
    <div className="flex flex-col items-center bg-base-100 shadow-lg shadow-accent/10 border-2 border-accent rounded-xl p-6 w-full max-w-lg">
      <h2 className="text-2xl font-bold text-primary mb-4">Your Account</h2>

      <div className="stats stats-vertical lg:stats-horizontal w-full">
        <div className="stat">
          <div className="stat-title">Status</div>
          <div className="stat-value flex items-center gap-2">
            {hasValidKey ? (
              <>
                <span className="text-success text-lg">Verified</span>
                <span className="text-2xl">✅</span>
              </>
            ) : (
              <>
                <span className="text-error text-lg">Unverified</span>
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
  );
};
