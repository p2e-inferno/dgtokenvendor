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
    contractName: "DAPPX",
    functionName: "symbol",
  });

  const { data: dgTokenName } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "name",
  });

  const { data: upTokenName } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "name",
  });

  const { data: vendorContractData } = useDeployedContractInfo("DGTokenVendor");

  const { data: vendorDGTokenBalance } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "balanceOf",
    args: [vendorContractData?.address],
  });

  const { data: vendorUPTokenBalance } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "balanceOf",
    args: [vendorContractData?.address],
  });

  const { data: feeConfig } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getFeeConfig",
  });


  const { data: exchangeRate } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getExchangeRate",
  });

  // Get exchange rate as a string
  const exchangeRateStr = exchangeRate !== undefined ? Number(exchangeRate).toString() : "0";

  const { data: systemState } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getSystemState",
  });

  // const { data: swapTokenFees } = useScaffoldReadContract({
  //   contractName: "DGTokenVendor",
  //   functionName: "swapTokenFees",
  // });

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
            <div>Buy Fee: {feeConfig ? (Number(feeConfig.buyFeeBps) / 100).toFixed(2) : "0"}%</div>
            <div>Sell Fee: {feeConfig ? (Number(feeConfig.sellFeeBps) / 100).toFixed(2) : "0"}%</div>
          </div>

          <div>
            <h3 className="font-bold text-lg">Collected Fees</h3>
            <div>
              {Number(formatEther(systemState?.baseTokenFees || 0n)).toFixed(4)} {upTokenSymbol}
            </div>
            <div>
              {Number(formatEther(systemState?.swapTokenFees || 0n)).toFixed(4)} {dgTokenSymbol}
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