import React, { useState } from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { IntegerInput } from "~~/components/token-vendor/IntegerInput";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useTokenTransaction } from "~~/hooks/useTokenTransaction";
import { calculateTokenConversion } from "~~/utils/token-vendor/calculations";

export const SellTokens = () => {
  const [tokensToSell, setTokensToSell] = useState<string>("");

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

  const { isApproved, isApprovalLoading, isTransactionLoading, handleApprove, handleTransaction } = useTokenTransaction(
    {
      tokenContractName: "DGToken",
      vendorContractName: "DGTokenVendor",
      tokenSymbol: (dgTokenSymbol as string) || "DGToken",
    },
  );

  const handleApproveTokens = async () => {
    if (tokensToSell) {
      await handleApprove(tokensToSell);
    }
  };

  const handleSellTokens = async () => {
    if (tokensToSell) {
      const success = await handleTransaction("sell", tokensToSell);
      if (success) {
        setTokensToSell("");
      }
    }
  };

  // Input is disabled if either approval or transaction is in progress
  const isInputDisabled = isApprovalLoading || isTransactionLoading;

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
          <button
            className={`btn ${isApproved ? "btn-disabled" : "btn-accent"} ${isApprovalLoading ? "loading" : ""}`}
            onClick={handleApproveTokens}
            disabled={isApproved || !tokensToSell || isInputDisabled}
          >
            Approve {dgTokenSymbol}
          </button>

          <button
            className={`btn btn-secondary ${isTransactionLoading ? "loading" : ""}`}
            onClick={handleSellTokens}
            disabled={!isApproved || !tokensToSell || isInputDisabled}
          >
            Sell Tokens
          </button>
        </div>
      </div>
    </div>
  );
};
