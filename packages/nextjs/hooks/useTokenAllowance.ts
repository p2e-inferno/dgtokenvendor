import { useCallback, useEffect, useState } from "react";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "./scaffold-eth";
import { Address, getAddress, isAddress, maxUint256 } from "viem";
import { useAccount } from "wagmi";
import { VendorContractName } from "~~/types/dgtoken-vendor";
import { TokenType } from "~~/types/dgtoken-vendor";
import { notification } from "~~/utils/scaffold-eth/notification";
import { multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";

interface UseTokenAllowanceProps {
  vendorContractName: VendorContractName;
}

interface AllowanceState {
  baseToken: {
    address: Address | undefined;
    contractName: string | undefined;
    symbol: string | undefined;
    allowance: bigint;
    hasAllowance: boolean;
    isApproving: boolean;
  };
  swapToken: {
    address: Address | undefined;
    contractName: string | undefined;
    symbol: string | undefined;
    allowance: bigint;
    hasAllowance: boolean;
    isApproving: boolean;
  };
}

export const useTokenAllowance = ({ vendorContractName }: UseTokenAllowanceProps) => {
  const { address: userAddress } = useAccount();
  const { data: vendorContractData } = useDeployedContractInfo(vendorContractName);
  const vendorAddress = vendorContractData?.address as Address | undefined;

  // Initialize the allowance state
  const [allowanceState, setAllowanceState] = useState<AllowanceState>({
    baseToken: {
      address: undefined,
      contractName: undefined,
      symbol: undefined,
      allowance: 0n,
      hasAllowance: false,
      isApproving: false,
    },
    swapToken: {
      address: undefined,
      contractName: undefined,
      symbol: undefined,
      allowance: 0n,
      hasAllowance: false,
      isApproving: false,
    },
  });

  // Get token configurations from the vendor contract
  const { data: tokenConfig } = useScaffoldReadContract({
    contractName: vendorContractName,
    functionName: "getTokenConfig",
  });

  const { data: baseTokenSymbol } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "symbol",
    query: { enabled: !!tokenConfig?.baseToken },
  });

  const { data: swapTokenSymbol } = useScaffoldReadContract({
    contractName: "UnlockProtocolToken",
    functionName: "symbol",
    query: { enabled: !!tokenConfig?.swapToken },
  });

  // Get allowances for both tokens
  const { data: baseTokenAllowance, refetch: refetchBaseTokenAllowance } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "allowance",
    args: [userAddress as Address, vendorAddress as Address],
    query: {
      enabled:
        !!userAddress &&
        !!vendorAddress &&
        !!tokenConfig?.baseToken &&
        isAddress(vendorAddress || "") &&
        isAddress(userAddress || ""),
    },
  });

  const { data: swapTokenAllowance, refetch: refetchSwapTokenAllowance } = useScaffoldReadContract({
    contractName: "UnlockProtocolToken",
    functionName: "allowance",
    args: [userAddress as Address, vendorAddress as Address],
    query: {
      enabled:
        !!userAddress &&
        !!vendorAddress &&
        !!tokenConfig?.swapToken &&
        isAddress(vendorAddress || "") &&
        isAddress(userAddress || ""),
    },
  });

  // Setup contract writes
  const { writeContractAsync: writeBaseTokenAsync } = useScaffoldWriteContract("DGToken");
  const { writeContractAsync: writeSwapTokenAsync } = useScaffoldWriteContract("UnlockProtocolToken");

  // Function to approve a token for the maximum amount (infinite approval)
  const approveToken = useCallback(
    async (tokenType: TokenType) => {
      const tokenInfo = allowanceState[tokenType];

      if (!tokenInfo.address || !vendorAddress) {
        notification.error(
          "Unable to approve token: Token or vendor address is not loaded yet. Please wait for data to load.",
        );
        console.error("useTokenAllowance: Pre-condition failed - tokenInfo.address or vendorAddress is undefined.", {
          tokenAddress: tokenInfo.address,
          vendorAddress,
        });
        return false;
      }

      if (!isAddress(tokenInfo.address)) {
        notification.error(
          `Unable to approve token: Invalid format for token address (${tokenInfo.symbol || tokenType}).`,
        );
        console.error("useTokenAllowance: Pre-condition failed - tokenInfo.address is not a valid address.", {
          tokenAddress: tokenInfo.address,
        });
        return false;
      }

      if (!isAddress(vendorAddress)) {
        notification.error("Unable to approve token: Invalid format for vendor contract address.");
        console.error("useTokenAllowance: Pre-condition failed - vendorAddress is not a valid address.", {
          vendorAddress,
        });
        return false;
      }

      // Set the approving state
      setAllowanceState(prev => ({
        ...prev,
        [tokenType]: {
          ...prev[tokenType],
          isApproving: true,
        },
      }));

      try {
        const writeAsync = tokenType === "baseToken" ? writeBaseTokenAsync : writeSwapTokenAsync;

        await writeAsync({
          functionName: "approve",
          args: [vendorAddress, maxUint256],
        });

        // Refetch the allowance
        if (tokenType === "baseToken") {
          await refetchBaseTokenAllowance();
        } else {
          await refetchSwapTokenAllowance();
        }

        notification.success(`${tokenInfo.symbol || tokenType} approved successfully!`);
        return true;
      } catch (err) {
        console.error(`Error approving ${tokenInfo.symbol || tokenType}:`, err);
        notification.error(`Failed to approve ${tokenInfo.symbol || tokenType}. See console for details.`);
        return false;
      } finally {
        // Reset the approving state
        setAllowanceState(prev => ({
          ...prev,
          [tokenType]: {
            ...prev[tokenType],
            isApproving: false,
          },
        }));
      }
    },
    [
      allowanceState,
      vendorAddress,
      writeBaseTokenAsync,
      writeSwapTokenAsync,
      refetchBaseTokenAllowance,
      refetchSwapTokenAllowance,
    ],
  );

  // Check if token has sufficient allowance for a specific amount
  const hasSufficientAllowance = useCallback(
    (tokenType: TokenType, amount: string) => {
      const tokenInfo = allowanceState[tokenType];

      if (!amount) return true; // If no amount provided, consider it sufficient
      if (!tokenInfo.address || !isAddress(tokenInfo.address)) return false;

      try {
        const amountInWei = multiplyTo1e18(amount);
        return tokenInfo.allowance >= amountInWei;
      } catch (e) {
        // If multiplyTo1e18 fails (e.g. invalid amount string), treat as insufficient
        console.error("Error converting amount to Wei in hasSufficientAllowance:", e);
        return false;
      }
    },
    [allowanceState],
  );

  // Update the allowance state when data changes
  useEffect(() => {
    if (tokenConfig && userAddress && vendorAddress) {
      // Ensure addresses are valid before using them to set state
      const baseOk = tokenConfig.baseToken && isAddress(tokenConfig.baseToken);
      const swapOk = tokenConfig.swapToken && isAddress(tokenConfig.swapToken);

      const baseTokenAddr = baseOk ? getAddress(tokenConfig.baseToken) : undefined;
      const swapTokenAddr = swapOk ? getAddress(tokenConfig.swapToken) : undefined;

      setAllowanceState(prev => ({
        baseToken: {
          ...prev.baseToken,
          address: baseTokenAddr,
          contractName: baseOk ? "DGToken" : undefined,
          symbol: baseOk ? (baseTokenSymbol as string | undefined) : undefined,
          allowance: baseTokenAllowance || 0n,
          hasAllowance: (baseTokenAllowance || 0n) > 0n,
        },
        swapToken: {
          ...prev.swapToken,
          address: swapTokenAddr,
          contractName: swapOk ? "UnlockProtocolToken" : undefined,
          symbol: swapOk ? (swapTokenSymbol as string | undefined) : undefined,
          allowance: swapTokenAllowance || 0n,
          hasAllowance: (swapTokenAllowance || 0n) > 0n,
        },
      }));
    } else {
      // If essential data is missing, reset parts of the state or ensure it's known to be unloaded
      setAllowanceState(prev => ({
        baseToken: { ...prev.baseToken, address: undefined, hasAllowance: false, allowance: 0n },
        swapToken: { ...prev.swapToken, address: undefined, hasAllowance: false, allowance: 0n },
      }));
    }
  }, [
    tokenConfig,
    userAddress,
    vendorAddress,
    baseTokenSymbol,
    swapTokenSymbol,
    baseTokenAllowance,
    swapTokenAllowance,
  ]);

  return {
    baseToken: allowanceState.baseToken,
    swapToken: allowanceState.swapToken,
    approveBaseToken: () => approveToken("baseToken"),
    approveSwapToken: () => approveToken("swapToken"),
    hasSufficientBaseTokenAllowance: (amount: string) => hasSufficientAllowance("baseToken", amount),
    hasSufficientSwapTokenAllowance: (amount: string) => hasSufficientAllowance("swapToken", amount),
    // Refresh functions
    refreshBaseTokenAllowance: refetchBaseTokenAllowance,
    refreshSwapTokenAllowance: refetchSwapTokenAllowance,
  };
};
