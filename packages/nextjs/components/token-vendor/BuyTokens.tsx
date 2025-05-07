import React, { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { IntegerInput } from "~~/components/token-vendor/IntegerInput";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useTokenAllowance } from "~~/hooks/useTokenAllowance";
import { notification } from "~~/utils/scaffold-eth/notification";
import { multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";
import { calculateTokenConversion } from "~~/utils/token-vendor/calculations";

export const BuyTokens = () => {
  const [tokensToBuy, setTokensToBuy] = useState<string>("");
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);

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

  const { writeContractAsync: buyTokens } = useScaffoldWriteContract("DGTokenVendor");

  const { swapToken, approveSwapToken, hasSufficientSwapTokenAllowance, refreshSwapTokenAllowance } = useTokenAllowance(
    {
      vendorContractName: "DGTokenVendor",
    },
  );

  const exchangeRateStr = exchangeRate !== undefined ? Number(exchangeRate).toString() : "0";
  const hasAllowanceForAmount = hasSufficientSwapTokenAllowance(tokensToBuy);

  const handleApproveTokens = async () => {
    if (tokensToBuy) {
      await approveSwapToken();
      await refreshSwapTokenAllowance();
    }
  };

  const handleBuyTokens = async () => {
    if (!tokensToBuy) return;

    setIsTransactionLoading(true);
    try {
      await buyTokens({
        functionName: "buyTokens",
        args: [multiplyTo1e18(tokensToBuy)],
      });
      notification.success(`Successfully purchased ${tokensToBuy} ${swapToken.symbol || "tokens"}!`);
      setTokensToBuy("");
      await refreshSwapTokenAllowance();
      return true;
    } catch (err) {
      console.error("Error buying tokens:", err);
      notification.error("Failed to buy tokens");
      return false;
    } finally {
      setIsTransactionLoading(false);
    }
  };

  const isInputDisabled = swapToken.isApproving || isTransactionLoading;
  const showApproveButton = !hasAllowanceForAmount && !!tokensToBuy && parseFloat(tokensToBuy) > 0;

  return (
    <div className="card bg-base-100 shadow-xl border border-primary/20">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-primary flex items-center gap-2">
            <ShoppingCartIcon className="h-6 w-6" />
            Buy Tokens
          </h2>
          <div className="badge badge-primary">Exchange</div>
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
          {showApproveButton && (
            <button
              className={`btn btn-secondary ${swapToken.isApproving ? "loading" : ""}`}
              onClick={handleApproveTokens}
              disabled={isInputDisabled || swapToken.isApproving}
            >
              {swapToken.isApproving ? "Approving..." : `Approve ${upTokenSymbol}`}
            </button>
          )}
          <button
            className={`btn btn-primary ${isTransactionLoading ? "loading" : ""}`}
            onClick={handleBuyTokens}
            disabled={!hasAllowanceForAmount || !tokensToBuy || parseFloat(tokensToBuy) <= 0 || isInputDisabled}
          >
            {isTransactionLoading ? "Processing..." : "Buy Tokens"}
          </button>
        </div>
      </div>
    </div>
  );
};
