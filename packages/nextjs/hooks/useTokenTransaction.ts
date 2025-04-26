import { useState } from "react";
import { usePrivyWallet } from "./privy/usePrivyWallet";
import { useDeployedContractInfo } from "./scaffold-eth";
import { Address, encodeFunctionData, parseEther } from "viem";
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

  const { data: tokenContractData } = useDeployedContractInfo(tokenContractName);
  const { data: vendorContractData } = useDeployedContractInfo(vendorContractName);
  const { sendTransaction } = usePrivyWallet();

  const handleApprove = async (amount: string) => {
    if (!amount || !vendorContractData?.address || !tokenContractData?.abi || !tokenContractData?.address) {
      notification.error("Approval prerequisites not met.");
      return;
    }

    setIsApprovalLoading(true);
    try {
      const data = encodeFunctionData({
        abi: tokenContractData.abi,
        functionName: "approve",
        args: [vendorContractData.address as Address, multiplyTo1e18(amount)],
      });

      await sendTransaction({ to: tokenContractData.address, data });

      setIsApproved(true);
      notification.success(`${tokenSymbol} approved successfully!`);
      return true;
    } catch (err: any) {
      console.error(`Error approving ${tokenSymbol}:`, err);
      notification.error(`Approval failed: ${err.shortMessage || err.message}`);
      setIsApproved(false);
      return false;
    } finally {
      setIsApprovalLoading(false);
    }
  };

  const handleTransaction = async (action: TokenAction, amount: string) => {
    if (!amount || !vendorContractData?.address || !vendorContractData?.abi) {
      notification.error("Transaction prerequisites not met.");
      return;
    }

    setIsTransactionLoading(true);
    const functionName = action === "buy" ? "buyTokens" : "sellTokens";

    try {
      const data = encodeFunctionData({
        abi: vendorContractData.abi,
        functionName: functionName,
        args: [multiplyTo1e18(amount)],
      });

      await sendTransaction({ to: vendorContractData.address, data });

      notification.success(`Successfully ${action === "buy" ? "purchased" : "sold"} ${amount} ${tokenSymbol}!`);
      setIsApproved(false);
      return true;
    } catch (err: any) {
      console.error(`Error ${action === "buy" ? "buying" : "selling"} tokens:`, err);
      notification.error(`Transaction failed: ${err.shortMessage || err.message}`);
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
