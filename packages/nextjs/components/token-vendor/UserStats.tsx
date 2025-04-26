import React, { useMemo } from "react";
import { formatEther } from "viem";
import { usePrivyWallet } from "~~/hooks/privy/usePrivyWallet";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const UserStats = () => {
  const { address, isConnected, ready } = usePrivyWallet();

  // Memoize the query config
  const baseQueryConfig = useMemo(
    () => ({
      enabled: ready && isConnected && !!address,
    }),
    [ready, isConnected, address],
  );

  const { data: dgTokenSymbol, isLoading: isLoadingDgSymbol } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "symbol",
  });

  const { data: upTokenSymbol, isLoading: isLoadingUpSymbol } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "symbol",
  });

  const { data: dgTokenName, isLoading: isLoadingDgName } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "name",
  });

  const { data: yourDGTokenBalance, isLoading: isLoadingDgBalance } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "balanceOf",
    args: [address],
    query: baseQueryConfig,
  });

  const { data: yourUPTokenBalance, isLoading: isLoadingUpBalance } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "balanceOf",
    args: [address],
    query: baseQueryConfig,
  });

  const { data: hasValidKey, isLoading: isLoadingKey } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "hasValidKey",
    args: [address],
    query: baseQueryConfig,
  });

  // Memoize loading state
  const isLoading = useMemo(
    () =>
      !ready ||
      isLoadingDgSymbol ||
      isLoadingUpSymbol ||
      isLoadingDgName ||
      isLoadingDgBalance ||
      isLoadingUpBalance ||
      isLoadingKey,
    [
      ready,
      isLoadingDgSymbol,
      isLoadingUpSymbol,
      isLoadingDgName,
      isLoadingDgBalance,
      isLoadingUpBalance,
      isLoadingKey,
    ],
  );

  if (!isConnected || !address) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl border-2 border-accent rounded-xl w-full animate-pulse">
        <div className="card-body flex flex-col items-center">
          <h2 className="card-title text-primary mb-4">Your Account</h2>
          <div className="stats stats-vertical lg:stats-horizontal w-full">
            <div className="stat">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 rounded w-full mt-1"></div>
            </div>
            <div className="stat">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 rounded w-full mt-1"></div>
            </div>
            <div className="stat">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 rounded w-full mt-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              {parseFloat(formatEther(yourDGTokenBalance ?? 0n)).toFixed(4)}
            </div>
            <div className="stat-desc">
              <span className="font-bold">{dgTokenSymbol}</span>
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">UP Token Balance</div>
            <div className="stat-value text-accent">{parseFloat(formatEther(yourUPTokenBalance ?? 0n)).toFixed(4)}</div>
            <div className="stat-desc">
              <span className="font-bold">{upTokenSymbol}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
