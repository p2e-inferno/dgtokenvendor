import React from "react";
import { formatEther } from "viem";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const VendorInfo = () => {
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

  const { data: upTokenName } = useScaffoldReadContract({
    contractName: "UnlockProtocolToken",
    functionName: "name",
  });

  const { data: vendorContractData } = useDeployedContractInfo("DGTokenVendor");

  const { data: vendorDGTokenBalance } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "balanceOf",
    args: [vendorContractData?.address],
  });

  const { data: vendorUPTokenBalance } = useScaffoldReadContract({
    contractName: "UnlockProtocolToken",
    functionName: "balanceOf",
    args: [vendorContractData?.address],
  });

  const { data: buyFeeBPS } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "buyFeeBPS",
  });

  const { data: sellFeeBPS } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "sellFeeBPS",
  });

  const { data: exchangeRate } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "exchangeRate",
  });

  // Get exchange rate as a string
  const exchangeRateStr = exchangeRate !== undefined ? Number(exchangeRate).toString() : "0";

  const { data: baseTokenFees } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "baseTokenFees",
  });

  const { data: swapTokenFees } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "swapTokenFees",
  });

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex gap-2">
          <BuildingStorefrontIcon className="h-6 w-6 text-primary" />
          Token Vendor Info
        </h2>

        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold text-lg">Vendor Address</h3>
            <div className="text-sm opacity-70 truncate">{vendorContractData?.address}</div>
          </div>

          <div>
            <h3 className="font-bold text-lg">Exchange Rate</h3>
            <div className="text-xl text-accent">
              {exchangeRateStr} {dgTokenSymbol} per {upTokenSymbol}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg">Vendor Balances</h3>
            <div className="badge badge-secondary mr-2">
              {Number(formatEther(vendorDGTokenBalance || 0n)).toFixed(4)} {dgTokenSymbol}
            </div>
            <div className="badge badge-primary">
              {Number(formatEther(vendorUPTokenBalance || 0n)).toFixed(4)} {upTokenSymbol}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg">Fees</h3>
            <div>Buy Fee: {buyFeeBPS ? (Number(buyFeeBPS) / 100).toFixed(2) : "0"}%</div>
            <div>Sell Fee: {sellFeeBPS ? (Number(sellFeeBPS) / 100).toFixed(2) : "0"}%</div>
          </div>

          <div>
            <h3 className="font-bold text-lg">Collected Fees</h3>
            <div>
              {Number(formatEther(baseTokenFees || 0n)).toFixed(4)} {upTokenSymbol}
            </div>
            <div>
              {Number(formatEther(swapTokenFees || 0n)).toFixed(4)} {dgTokenSymbol}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg">Tokens</h3>
            <div>
              Base: {upTokenName} ({upTokenSymbol})
            </div>
            <div>
              Swap: {dgTokenName} ({dgTokenSymbol})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
