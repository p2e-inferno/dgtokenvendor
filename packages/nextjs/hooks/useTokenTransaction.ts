import { useState } from "react";
import { useDeployedContractInfo, useScaffoldWriteContract } from "./scaffold-eth";
import { Address } from "viem";
import { TokenAction, TokenContractName, VendorContractName } from "~~/types/dgtoken-vendor";
import { notification } from "~~/utils/scaffold-eth/notification";
import { multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";

interface UseTokenTransactionProps {
  tokenContractName: TokenContractName;
  vendorContractName: VendorContractName;
  tokenSymbol: string;
}

export const useTokenTransaction = ({
  tokenContractName,
  vendorContractName,
  tokenSymbol,
}: UseTokenTransactionProps) => {
  const [isApproved, setIsApproved] = useState(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);

  const { data: vendorContractData } = useDeployedContractInfo(vendorContractName);
  const { writeContractAsync: writeTokenAsync } = useScaffoldWriteContract(tokenContractName);
  const { writeContractAsync: writeVendorAsync } = useScaffoldWriteContract(vendorContractName);

  const handleApprove = async (amount: string) => {
    if (!amount || !vendorContractData?.address) return;

    setIsApprovalLoading(true);
    try {
      await writeTokenAsync({
        functionName: "approve",
        args: [vendorContractData.address as Address, multiplyTo1e18(amount)],
      });
      setIsApproved(true);
      notification.success(`${tokenSymbol} approved successfully!`);
      return true;
    } catch (err) {
      console.error(`Error approving ${tokenSymbol}:`, err);

      setIsApproved(false);
      return false;
    } finally {
      setIsApprovalLoading(false);
    }
  };

  const handleTransaction = async (action: TokenAction, amount: string) => {
    if (!amount) return;

    setIsTransactionLoading(true);
    try {
      await writeVendorAsync({
        functionName: action === "buy" ? "buyTokens" : "sellTokens",
        args: [multiplyTo1e18(amount)],
      });
      notification.success(`Successfully ${action === "buy" ? "purchased" : "sold"} ${amount} ${tokenSymbol}!`);
      // Reset approval state after successful transaction
      setIsApproved(false);
      return true;
    } catch (err) {
      console.error(`Error ${action === "buy" ? "buying" : "selling"} tokens:`, err);
      return false;
    } finally {
      setIsTransactionLoading(false);
    }
  };

  const resetApproval = () => {
    setIsApproved(false);
  };

  return {
    isApproved,
    isApprovalLoading,
    isTransactionLoading,
    handleApprove,
    handleTransaction,
    resetApproval,
  };
};
