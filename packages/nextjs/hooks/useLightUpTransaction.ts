import { useState } from "react";
import { useDeployedContractInfo, useScaffoldWriteContract } from "./scaffold-eth";
import { Address } from "viem";
import { TokenContractName, VendorContractName } from "~~/types/dgtoken-vendor";
import { notification } from "~~/utils/scaffold-eth/notification";
import { multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";

interface UseLightUpTransactionProps {
  tokenContractName: TokenContractName;
  vendorContractName: VendorContractName;
  tokenSymbol: string;
}

export const useLightUpTransaction = ({
  tokenContractName,
  vendorContractName,
  tokenSymbol,
}: UseLightUpTransactionProps) => {
  const [isApproved, setIsApproved] = useState(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const [isLightUpLoading, setIsLightUpLoading] = useState(false);

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
      notification.error(`Failed to approve ${tokenSymbol}`);
      return false;
    } finally {
      setIsApprovalLoading(false);
    }
  };

  const handleLightUp = async () => {
    setIsLightUpLoading(true);
    try {
      await writeVendorAsync({
        functionName: "lightUp",
      });
      notification.success(`Successfully lit up and increased fuel!`);
      // Reset approval state after successful transaction
      setIsApproved(false);
      return true;
    } catch (err) {
      console.error(`Error lighting up:`, err);
      notification.error("Failed to light up");
      return false;
    } finally {
      setIsLightUpLoading(false);
    }
  };

  const resetApproval = () => {
    setIsApproved(false);
  };

  return {
    isApproved,
    isApprovalLoading,
    isLightUpLoading,
    handleApprove,
    handleLightUp,
    resetApproval,
  };
};
