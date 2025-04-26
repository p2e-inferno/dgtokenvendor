import { useEffect } from "react";
import { QueryObserverResult, RefetchOptions, useQueryClient } from "@tanstack/react-query";
import type { ExtractAbiFunctionNames } from "abitype";
import { ReadContractErrorType } from "viem";
import { useBlockNumber, useReadContract } from "wagmi";
import { usePrivyWallet } from "~~/hooks/privy/usePrivyWallet";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { AllowedChainIds } from "~~/utils/scaffold-eth";
import {
  AbiFunctionReturnType,
  ContractAbi,
  ContractName,
  UseScaffoldReadConfig,
} from "~~/utils/scaffold-eth/contract";

/**
 * Wrapper around wagmi's useReadContract hook which automatically loads contract ABI and address,
 * and uses the wallet address and chainId from the consolidated usePrivyWallet hook.
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 * @param config.chainId - This is effectively ignored now, chainId comes from usePrivyWallet
 */
export const useScaffoldReadContract = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "pure" | "view">,
>({
  contractName,
  functionName,
  args,
  // chainId is ignored, taken from usePrivyWallet
  ...readConfig
}: UseScaffoldReadConfig<TContractName, TFunctionName>) => {
  const { chainId, isConnected, address: connectedAddress } = usePrivyWallet(); // Use consolidated hook

  const { data: deployedContract } = useDeployedContractInfo({
    contractName,
    chainId: chainId as AllowedChainIds, // Use chainId from hook
  });

  const { query: queryOptions, watch, cacheTime, enabled, staleTime, ...readContractConfig } = readConfig;
  const defaultWatch = watch ?? true;

  // Use the connected wallet address for the query key if required by function args
  // This helps invalidate queries correctly when the address changes.
  // Note: This assumes the address is typically the first arg if needed.
  const queryKeyAddress =
    args && Array.isArray(args) && args.length > 0 && typeof args[0] === "string" && args[0].startsWith("0x")
      ? connectedAddress // Use connected address if first arg looks like an address
      : undefined;

  const readContractHookRes = useReadContract({
    chainId: chainId, // Use chainId from hook
    functionName,
    address: deployedContract?.address,
    abi: deployedContract?.abi,
    args,
    account: connectedAddress, // Pass account for better wagmi context
    ...(readContractConfig as any),
    query: {
      enabled:
        enabled ?? // Respect explicit enabled flag
        (isConnected && // Only run if connected
          !!deployedContract && // Ensure contract is loaded
          (!Array.isArray(args) || !args.some(arg => arg === undefined))), // Ensure args are valid
      ...queryOptions,
    },
  }) as Omit<ReturnType<typeof useReadContract>, "data" | "refetch"> & {
    data: AbiFunctionReturnType<ContractAbi, TFunctionName> | undefined;
    refetch: (
      options?: RefetchOptions | undefined,
    ) => Promise<QueryObserverResult<AbiFunctionReturnType<ContractAbi, TFunctionName>, ReadContractErrorType>>;
  };

  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    watch: defaultWatch,
    chainId: chainId, // Use chainId from hook
    query: {
      enabled: defaultWatch && !!readContractHookRes.query?.enabled, // Safely access enabled
    },
  });

  // Invalidate query on block number change if watching
  useEffect(() => {
    if (defaultWatch && readContractHookRes.query?.enabled) {
      // Safely access enabled
      // Invalidate based on a more specific query key if address is involved
      const queryKey = queryKeyAddress
        ? [readContractHookRes.queryKey[0], queryKeyAddress, readContractHookRes.queryKey[2]] // Simplified assumption
        : readContractHookRes.queryKey;
      queryClient.invalidateQueries({ queryKey });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber, queryClient, defaultWatch, readContractHookRes.query?.enabled, queryKeyAddress]); // Safely access enabled

  // Also invalidate query if the connected address changes and was part of the key
  useEffect(() => {
    if (queryKeyAddress) {
      const queryKey = [readContractHookRes.queryKey[0], connectedAddress, readContractHookRes.queryKey[2]];
      queryClient.invalidateQueries({ queryKey });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, queryClient, queryKeyAddress]);

  return readContractHookRes;
};
