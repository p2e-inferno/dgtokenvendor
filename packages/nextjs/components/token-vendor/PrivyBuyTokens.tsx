"use client";

import React, { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { IntegerInput } from "~~/components/token-vendor/IntegerInput";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { usePrivyTokenTransaction } from "~~/hooks/usePrivyTokenTransaction";
import { calculateTokenConversion } from "~~/utils/token-vendor/calculations";

/**
 * BuyTokens component that uses Privy for a frictionless experience
 */
export const PrivyBuyTokens = () => {
  const [tokensToBuy, setTokensToBuy] = useState<string>("");

  const { data: dgTokenSymbol } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "symbol",
  });

  const { data: upTokenSymbol } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "symbol",
  });

  const { data: exchangeRate } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getExchangeRate",
  });

  const { data: feeConfig } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getFeeConfig",
  });

  const exchangeRateStr = exchangeRate !== undefined ? Number(exchangeRate).toString() : "0";

  // Use the Privy token transaction hook
  const { isApproved, isApprovalLoading, isTransactionLoading, handleApprove, handleTransaction } =
    usePrivyTokenTransaction({
      tokenContractName: "DAPPX",
      vendorContractName: "DGTokenVendor",
      tokenSymbol: (upTokenSymbol as string) || "DAPPX",
    });

  // Handle approving tokens
  const handleApproveTokens = async () => {
    if (tokensToBuy) {
      await handleApprove(tokensToBuy);
    }
  };

  // Handle buying tokens
  const handleBuyTokens = async () => {
    if (tokensToBuy) {
      const success = await handleTransaction("buy", tokensToBuy);
      if (success) {
        setTokensToBuy("");
      }
    }
  };

  // Input is disabled if either approval or transaction is in progress
  const isInputDisabled = isApprovalLoading || isTransactionLoading;

  return (
    <div className="card bg-base-100 shadow-xl border border-primary/20">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-primary flex items-center gap-2">
            <ShoppingCartIcon className="h-6 w-6" />
            Buy Tokens (Frictionless)
          </h2>
          <div className="badge badge-primary">Privy Powered</div>
        </div>

        <p className="text-sm text-base-content/70 mb-4">
          Exchange your {upTokenSymbol} for {dgTokenSymbol} at the current rate of{" "}
          <span className="font-semibold text-primary">
            {exchangeRateStr} {dgTokenSymbol} per {upTokenSymbol}
          </span>
          {feeConfig && Number(feeConfig.buyFeeBps) > 0 && (
            <span className="block mt-1 text-xs">(Fee: {Number(feeConfig.buyFeeBps) / 100}%)</span>
          )}
        </p>

        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Amount of {upTokenSymbol} to spend</span>
          </label>
          <IntegerInput
            value={tokensToBuy}
            onChange={setTokensToBuy}
            placeholder={`Enter amount of ${upTokenSymbol}`}
            disabled={isInputDisabled}
            disableMultiplyBy1e18
          />
          {tokensToBuy && (
            <label className="label">
              <span className="label-text-alt">
                You&apos;ll receive approximately{" "}
                <span className="font-semibold">
                  {calculateTokenConversion("buy", tokensToBuy, exchangeRate, feeConfig)} {dgTokenSymbol}
                </span>
              </span>
            </label>
          )}
        </div>

        <div className="card-actions justify-end">
          <button
            className={`btn ${isApproved ? "btn-disabled" : "btn-secondary"} ${isApprovalLoading ? "loading" : ""}`}
            onClick={handleApproveTokens}
            disabled={isApproved || !tokensToBuy || isInputDisabled}
          >
            Approve {upTokenSymbol}
          </button>

          <button
            className={`btn btn-primary ${isTransactionLoading ? "loading" : ""}`}
            onClick={handleBuyTokens}
            disabled={!isApproved || !tokensToBuy || isInputDisabled}
          >
            Buy Tokens
          </button>
        </div>

        <div className="mt-4 text-xs text-base-content/70">
          <p>Powered by Privy: No transaction confirmation popups for a smoother experience.</p>
        </div>
      </div>
    </div>
  );
};
