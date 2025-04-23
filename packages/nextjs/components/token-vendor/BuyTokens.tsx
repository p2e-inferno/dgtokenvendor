import React, { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { IntegerInput } from "~~/components/token-vendor/IntegerInput";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notifyError, notifySuccess } from "~~/utils/notification";
import { multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";

export const BuyTokens = () => {
  const [tokensToBuy, setTokensToBuy] = useState<string>("");
  const [isUPTokenApproved, setIsUPTokenApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const { data: vendorContractData } = useDeployedContractInfo("DGTokenVendor");
  const { writeContractAsync: writeVendorAsync } = useScaffoldWriteContract("DGTokenVendor");
  const { writeContractAsync: writeDAPPXAsync } = useScaffoldWriteContract("DAPPX");

  const handleApproveTokens = async () => {
    if (!tokensToBuy || !vendorContractData?.address) return;

    setIsLoading(true);
    try {
      await writeDAPPXAsync({
        functionName: "approve",
        args: [vendorContractData.address, multiplyTo1e18(tokensToBuy)],
      });
      setIsUPTokenApproved(true);
      notifySuccess("Tokens approved successfully!");
    } catch (err) {
      console.error("Error approving tokens:", err);
      notifyError(err);
      setIsUPTokenApproved(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyTokens = async () => {
    if (!tokensToBuy) return;

    setIsLoading(true);
    try {
      await writeVendorAsync({
        functionName: "buyTokens",
        args: [multiplyTo1e18(tokensToBuy)],
      });
      notifySuccess(`Successfully purchased ${tokensToBuy} ${dgTokenSymbol}!`);
      // Reset form after successful purchase
      setTokensToBuy("");
      setIsUPTokenApproved(false);
    } catch (err) {
      console.error("Error buying tokens:", err);
      notifyError(err);
    } finally {
      setIsLoading(false);
    }
  };

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
            disabled={isLoading}
            disableMultiplyBy1e18
          />
          {tokensToBuy && (
            <label className="label">
              <span className="label-text-alt">
                You&apos;ll receive approximately{" "}
                <span className="font-semibold">
                  {Number(tokensToBuy) * Number(exchangeRate || 0)} {dgTokenSymbol}
                </span>
              </span>
            </label>
          )}
        </div>

        <div className="card-actions justify-end">
          <button
            className={`btn ${isUPTokenApproved ? "btn-disabled" : "btn-secondary"} ${isLoading ? "loading" : ""}`}
            onClick={handleApproveTokens}
            disabled={isUPTokenApproved || !tokensToBuy || isLoading}
          >
            Approve {upTokenSymbol}
          </button>

          <button
            className={`btn btn-primary ${isLoading ? "loading" : ""}`}
            onClick={handleBuyTokens}
            disabled={!isUPTokenApproved || !tokensToBuy || isLoading}
          >
            Buy Tokens
          </button>
        </div>
      </div>
    </div>
  );
};
