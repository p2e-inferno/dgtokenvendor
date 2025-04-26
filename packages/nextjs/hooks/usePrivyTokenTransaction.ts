"use client";

import { useState } from "react";
import { usePrivyTransactor } from "./privy/usePrivyTransactor";
import { useScaffoldReadContract, useScaffoldWriteContract } from "./scaffold-eth";
import { toast } from "react-hot-toast";

interface TokenTransactionProps {
  tokenContractName: string;
  vendorContractName: string;
  tokenSymbol: string;
}

/**
 * A hook for token transactions using Privy for a frictionless experience
 * Removes confirmation prompts and simplifies the approval and buy/sell flow
 */
export const usePrivyTokenTransaction = ({
  tokenContractName,
  vendorContractName,
  tokenSymbol,
}: TokenTransactionProps) => {
  const [isApproved, setIsApproved] = useState(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);

  const privyTransactor = usePrivyTransactor();

  // Configuration for approving tokens
  const { writeAsync: approveTokens } = useScaffoldWriteContract({
    contractName: tokenContractName,
    functionName: "approve",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      setIsApproved(true);
      setIsApprovalLoading(false);
    },
  });

  // Configuration for buying tokens
  const { writeAsync: buyTokens } = useScaffoldWriteContract({
    contractName: vendorContractName,
    functionName: "buyTokens",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      setIsTransactionLoading(false);
    },
  });

  // Configuration for selling tokens
  const { writeAsync: sellTokens } = useScaffoldWriteContract({
    contractName: vendorContractName,
    functionName: "sellTokens",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      setIsTransactionLoading(false);
    },
  });

  // Get vendor contract address
  const { data: vendorAddress } = useScaffoldReadContract({
    contractName: vendorContractName,
    functionName: "getAddress",
  });

  // Function to handle token approval
  const handleApprove = async (amount: string) => {
    if (!vendorAddress) {
      console.error("Vendor address not available");
      return false;
    }

    setIsApprovalLoading(true);
    try {
      // Convert amount to wei (if needed, your specific logic may vary)
      const amountInTokenUnit = BigInt(parseFloat(amount) * 10 ** 18);

      // Use Privy transactor directly to avoid confirmation popups
      await privyTransactor({
        to: await approveTokens({ args: [vendorAddress, amountInTokenUnit] }),
      });

      toast.success(`${tokenSymbol} approved for spending`);
      setIsApproved(true);
      return true;
    } catch (error: any) {
      console.error("Error in approval:", error);
      toast.error("Error approving tokens: " + (error.message || "Unknown error"));
      setIsApprovalLoading(false);
      return false;
    }
  };

  // Function to handle the transaction (buy or sell)
  const handleTransaction = async (type: "buy" | "sell", amount: string) => {
    if (!vendorAddress) {
      console.error("Vendor address not available");
      return false;
    }

    setIsTransactionLoading(true);
    try {
      // Convert amount to wei (if needed, your specific logic may vary)
      const amountInTokenUnit = BigInt(parseFloat(amount) * 10 ** 18);

      let tx;
      if (type === "buy") {
        // Use Privy transactor for buy
        tx = await privyTransactor({
          to: await buyTokens({ args: [amountInTokenUnit] }),
        });
      } else {
        // Use Privy transactor for sell
        tx = await privyTransactor({
          to: await sellTokens({ args: [amountInTokenUnit] }),
        });
      }

      toast.success(`${type === "buy" ? "Bought" : "Sold"} tokens successfully!`);
      setIsApproved(false); // Reset approval state after transaction
      return true;
    } catch (error: any) {
      console.error(`Error in ${type} transaction:`, error);
      toast.error(`Error ${type === "buy" ? "buying" : "selling"} tokens: ` + (error.message || "Unknown error"));
      setIsTransactionLoading(false);
      return false;
    }
  };

  return {
    isApproved,
    isApprovalLoading,
    isTransactionLoading,
    handleApprove,
    handleTransaction,
  };
};
