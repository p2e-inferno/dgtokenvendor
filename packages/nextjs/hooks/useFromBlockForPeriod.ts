import { useCallback, useMemo } from "react";
import * as chains from "viem/chains";
import { useBlockNumber } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

/**
 * Hook to calculate a fromBlock value for a specified time period
 * @param days Number of days to look back (default: 30)
 * @returns The calculated fromBlock value as a bigint
 */
export const useFromBlockForPeriod = (days = 30) => {
  const { targetNetwork } = useTargetNetwork();
  const { data: currentBlockNumber } = useBlockNumber({ watch: false });

  // Get the average blocks per day based on chain
  const getBlocksPerDay = useCallback(() => {
    // Default to Ethereum (~12 sec blocks)
    const DEFAULT_BLOCKS_PER_DAY = 7200n;

    if (!targetNetwork.id) return DEFAULT_BLOCKS_PER_DAY;

    // Different chains have different block times
    switch (targetNetwork.id) {
      case chains.mainnet.id: // Ethereum Mainnet
        return 7200n; // ~12 sec blocks
      case chains.polygon.id: // Polygon
        return 43200n; // ~2 sec blocks
      case chains.base.id: // Base
      case chains.baseSepolia.id: // Base Sepolia
        return 40000n; // ~2.2 sec blocks
      case chains.optimism.id: // Optimism
      case chains.arbitrum.id: // Arbitrum
        return 43200n; // ~2 sec blocks
      case chains.sepolia.id: // Sepolia
        return 7200n; // ~12 sec blocks
      case chains.hardhat.id: // Local development
        return 7200n; // Arbitrary value for local development
      default:
        return DEFAULT_BLOCKS_PER_DAY; // Default fallback
    }
  }, [targetNetwork.id]);

  // Calculate and memoize the fromBlock value
  const fromBlock = useMemo(() => {
    if (!currentBlockNumber) return 0n;

    const blocksPerDay = getBlocksPerDay();
    const periodInBlocks = blocksPerDay * BigInt(days);

    // Don't go negative, use a safe minimum
    return currentBlockNumber > periodInBlocks ? currentBlockNumber - periodInBlocks : 0n;
  }, [currentBlockNumber, days, getBlocksPerDay]);

  return {
    fromBlock,
    currentBlock: currentBlockNumber || 0n,
    isLoading: !currentBlockNumber,
  };
};
