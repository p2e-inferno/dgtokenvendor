import React, { useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { IntegerInput } from "~~/components/token-vendor/IntegerInput";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notifyError, notifySuccess } from "~~/utils/notification";
import { multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";

export const SellTokens = () => {
  const [tokensToSell, setTokensToSell] = useState<string>("");
  const [isDGTokenApproved, setIsDGTokenApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { address } = useAccount();

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

  const { data: vendorContractData } = useDeployedContractInfo("DGTokenVendor");
  const { writeContractAsync: writeVendorAsync } = useScaffoldWriteContract("DGTokenVendor");
  const { writeContractAsync: writeDGTokenAsync } = useScaffoldWriteContract("DGToken");

  // Get exchange rate as a string
  const exchangeRateStr = exchangeRate !== undefined ? Number(exchangeRate).toString() : "0";

  // Calculate return amount based on exchange rate and sell fee
  const calculateReturn = (amount: string) => {
    if (!amount || !exchangeRate || !feeConfig) return "0";

    const sellAmount = Number(amount);
    const rate = Number(exchangeRate);
    const fee = Number(feeConfig.sellFeeBps) / 10000; // Convert basis points to percentage

    if (sellAmount <= 0 || rate <= 0) return "0";

    const tokenAmount = sellAmount / rate;
    const feeAmount = tokenAmount * fee;
    const netReturn = tokenAmount - feeAmount;

    return netReturn.toFixed(6);
  };

  const handleApproveTokens = async () => {
    if (!tokensToSell || !vendorContractData?.address) return;

    setIsLoading(true);
    try {
      await writeDGTokenAsync({
        functionName: "approve",
        args: [vendorContractData.address, multiplyTo1e18(tokensToSell)],
      });
      setIsDGTokenApproved(true);
      notifySuccess("Tokens approved successfully!");
    } catch (err) {
      console.error("Error approving tokens:", err);
      notifyError(err);
      setIsDGTokenApproved(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellTokens = async () => {
    if (!tokensToSell) return;

    setIsLoading(true);
    try {
      await writeVendorAsync({
        functionName: "sellTokens",
        args: [multiplyTo1e18(tokensToSell)],
      });
      notifySuccess(`Successfully sold ${tokensToSell} ${dgTokenSymbol}!`);
      // Reset form after successful sale
      setTokensToSell("");
      setIsDGTokenApproved(false);
    } catch (err) {
      console.error("Error selling tokens:", err);
      notifyError(err);
    } finally {
      setIsLoading(false);
    }
  };

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
            disabled={isLoading}
            disableMultiplyBy1e18
          />
          {tokensToSell && (
            <label className="label">
              <span className="label-text-alt">
                You&apos;ll receive approximately{" "}
                <span className="font-semibold">
                  {calculateReturn(tokensToSell)} {upTokenSymbol}
                </span>
              </span>
            </label>
          )}
        </div>

        <div className="card-actions justify-end">
          <button
            className={`btn ${isDGTokenApproved ? "btn-disabled" : "btn-accent"} ${isLoading ? "loading" : ""}`}
            onClick={handleApproveTokens}
            disabled={isDGTokenApproved || !tokensToSell || isLoading}
          >
            Approve {dgTokenSymbol}
          </button>

          <button
            className={`btn btn-secondary ${isLoading ? "loading" : ""}`}
            onClick={handleSellTokens}
            disabled={!isDGTokenApproved || !tokensToSell || isLoading}
          >
            Sell Tokens
          </button>
        </div>
      </div>
    </div>
  );
};
