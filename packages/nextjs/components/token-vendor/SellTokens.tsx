import React, { useState } from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { IntegerInput } from "~~/components/token-vendor/IntegerInput";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useTokenAllowance } from "~~/hooks/useTokenAllowance";
import { notification } from "~~/utils/scaffold-eth/notification";
import { multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";
import { calculateTokenConversion } from "~~/utils/token-vendor/calculations";

export const SellTokens = () => {
  const [tokensToSell, setTokensToSell] = useState<string>("");
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

  const { writeContractAsync: sellTokens } = useScaffoldWriteContract("DGTokenVendor");

  const { baseToken, approveBaseToken, hasSufficientBaseTokenAllowance, refreshBaseTokenAllowance } = useTokenAllowance(
    {
      vendorContractName: "DGTokenVendor",
    },
  );

  const hasAllowanceForAmount = hasSufficientBaseTokenAllowance(tokensToSell);

  const handleApproveTokens = async () => {
    if (tokensToSell) {
      await approveBaseToken();
      await refreshBaseTokenAllowance();
    }
  };

  const handleSellTokens = async () => {
    if (!tokensToSell) return;

    setIsTransactionLoading(true);
    try {
      await sellTokens({
        functionName: "sellTokens",
        args: [multiplyTo1e18(tokensToSell)],
      });
      notification.success(`Successfully sold ${tokensToSell} ${baseToken.symbol || "tokens"}!`);
      setTokensToSell("");
      await refreshBaseTokenAllowance();
      return true;
    } catch (err) {
      console.error("Error selling tokens:", err);
      notification.error("Failed to sell tokens");
      return false;
    } finally {
      setIsTransactionLoading(false);
    }
  };

  const isInputDisabled = baseToken.isApproving || isTransactionLoading;
  const showApproveButton = !hasAllowanceForAmount && !!tokensToSell && parseFloat(tokensToSell) > 0;

  return (
    <div className="card bg-base-100 shadow-xl border border-secondary/20">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-secondary flex items-center gap-2">
            <CurrencyDollarIcon className="h-6 w-6" />
            Sell Tokens
          </h2>
          <div className="badge badge-secondary">Exchange</div>
        </div>

        <p className="text-sm text-base-content/70 mb-4">
          Sell your {dgTokenSymbol} for {upTokenSymbol} at the current rate of{" "}
          <span className="font-semibold text-secondary">
            {1 / Number(exchangeRate)} {upTokenSymbol} per {dgTokenSymbol}
          </span>
          {feeConfig && Number(feeConfig.sellFeeBps) > 0 && (
            <span className="block mt-1 text-xs">(Fee: {Number(feeConfig.sellFeeBps) / 100}%)</span>
          )}
        </p>

        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Amount of {dgTokenSymbol} to sell</span>
          </label>
          <IntegerInput
            value={tokensToSell}
            onChange={setTokensToSell}
            placeholder={`Enter amount of ${dgTokenSymbol}`}
            disabled={isInputDisabled}
            disableMultiplyBy1e18
          />
          {tokensToSell && (
            <label className="label">
              <span className="label-text-alt">
                You&apos;ll receive approximately{" "}
                <span className="font-semibold">
                  {calculateTokenConversion("sell", tokensToSell, exchangeRate, feeConfig)} {upTokenSymbol}
                </span>
              </span>
            </label>
          )}
        </div>

        <div className="card-actions justify-end">
          {showApproveButton && (
            <button
              className={`btn btn-accent ${baseToken.isApproving ? "loading" : ""}`}
              onClick={handleApproveTokens}
              disabled={isInputDisabled || baseToken.isApproving}
            >
              {baseToken.isApproving ? "Approving..." : `Approve ${dgTokenSymbol}`}
            </button>
          )}
          <button
            className={`btn btn-secondary ${isTransactionLoading ? "loading" : ""}`}
            onClick={handleSellTokens}
            disabled={!hasAllowanceForAmount || !tokensToSell || parseFloat(tokensToSell) <= 0 || isInputDisabled}
          >
            {isTransactionLoading ? "Processing..." : "Sell Tokens"}
          </button>
        </div>
      </div>
    </div>
  );
};
