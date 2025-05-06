import React, { useEffect, useState } from "react";
import { RecentActivitySkeleton } from "../skeletons/RecentActivitySkeleton";
import { formatDistanceToNow } from "date-fns";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { UserStage } from "~~/types/dgtoken-vendor";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

const stageLabels: Record<UserStage, string> = {
  [UserStage.PLEB]: "Pleb",
  [UserStage.HUSTLER]: "Hustler",
  [UserStage.OG]: "OG Trader",
};

interface RecentActivityProps {
  userAddress?: string;
  dgTokenSymbol?: string;
}

interface ProcessedEvent {
  id: string; // Unique ID for React key, e.g., transactionHash + logIndex
  type: string;
  conciseDetails: string; // For potential future use like tooltips
  amount?: string;
  status: React.ReactNode; // To show 'Complete' or similar
  time: string;
  txHash: string;
  blockTimestamp: bigint;
  log: any; // Store the raw log for debugging or more detailed views if needed
}

export const RecentActivity = ({ userAddress, dgTokenSymbol }: RecentActivityProps) => {
  const { chain } = useAccount();
  const [allProcessedEvents, setAllProcessedEvents] = useState<ProcessedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const commonEventConfig = {
    contractName: "DGTokenVendor" as const,
    fromBlock: 0n, // Consider using a more recent block for performance in production
    filters: undefined, // Default, will be overridden for user-specific events
    blockData: true as const,
    transactionData: false as const,
    receiptData: false as const,
    watch: false, // Set to true if you want live updates, might be performance intensive
    enabled: !!userAddress, // Only enable if userAddress is present
  };

  // Lit Events
  const { data: litEventsData, isLoading: isLoadingLit } = useScaffoldEventHistory({
    ...commonEventConfig,
    eventName: "Lit" as const,
    filters: userAddress ? { user: userAddress } : undefined,
  });

  // StageUpgraded Events
  const { data: stageUpgradedEventsData, isLoading: isLoadingStageUpgraded } = useScaffoldEventHistory({
    ...commonEventConfig,
    eventName: "StageUpgraded" as const,
    filters: userAddress ? { user: userAddress } : undefined,
  });

  // TokensPurchased Events
  const { data: tokensPurchasedEventsData, isLoading: isLoadingTokensPurchased } = useScaffoldEventHistory({
    ...commonEventConfig,
    eventName: "TokensPurchased" as const,
    filters: userAddress ? { buyer: userAddress } : undefined,
  });

  // TokensSold Events
  const { data: tokensSoldEventsData, isLoading: isLoadingTokensSold } = useScaffoldEventHistory({
    ...commonEventConfig,
    eventName: "TokensSold" as const,
    filters: userAddress ? { seller: userAddress } : undefined,
  });

  // Effect to process and combine events once data is loaded
  useEffect(() => {
    console.log("[RecentActivity] useEffect triggered. User Address:", userAddress);
    console.log("[RecentActivity] Loading states:", {
      lit: isLoadingLit,
      stageUpgraded: isLoadingStageUpgraded,
      tokensPurchased: isLoadingTokensPurchased,
      tokensSold: isLoadingTokensSold,
    });

    if (isLoadingLit || isLoadingStageUpgraded || isLoadingTokensPurchased || isLoadingTokensSold) {
      setIsLoading(true);
      console.log("[RecentActivity] Still loading one or more event types.");
      return;
    }

    console.log("[RecentActivity] All event hooks have loaded.");
    console.log("[RecentActivity] Raw litEventsData:", litEventsData);
    console.log("[RecentActivity] Raw stageUpgradedEventsData:", stageUpgradedEventsData);
    console.log("[RecentActivity] Raw tokensPurchasedEventsData:", tokensPurchasedEventsData);
    console.log("[RecentActivity] Raw tokensSoldEventsData:", tokensSoldEventsData);

    const processEvents = () => {
      console.log("[RecentActivity] Starting processEvents function.");
      const newProcessedEvents: ProcessedEvent[] = [];

      // Directly use the data if it's an array, otherwise, it might be undefined or needs flattening if paginated structure is sometimes returned
      const getEventArray = (data: any, name: string): any[] => {
        if (Array.isArray(data)) {
          console.log(`[RecentActivity] Event data for ${name} is already an array:`, data);
          return data;
        }
        return [];
      };

      const flatLitEvents = getEventArray(litEventsData, "LitEvents");
      const flatStageUpgradedEvents = getEventArray(stageUpgradedEventsData, "StageUpgradedEvents");
      const flatTokensPurchasedEvents = getEventArray(tokensPurchasedEventsData, "TokensPurchasedEvents");
      const flatTokensSoldEvents = getEventArray(tokensSoldEventsData, "TokensSoldEvents");

      flatLitEvents.forEach((eventLog: any) => {
        const { args, blockHash, transactionHash, logIndex } = eventLog;

        if (args && blockHash && transactionHash && args.user === userAddress && eventLog.blockData) {
          // Ensure blockData exists
          newProcessedEvents.push({
            id: `${transactionHash}-${logIndex}`,
            type: "Lit",
            conciseDetails: `Burned ${formatEther(args.burnAmount || 0n)} ${dgTokenSymbol || "tokens"} for ${Number(args.newFuel).toString()} Fuel`,
            amount: `${formatEther(args.burnAmount || 0n)} ${dgTokenSymbol || ""}`,
            status: <span className="badge badge-info badge-sm">Fuel Up</span>,
            time: eventLog.blockData?.timestamp
              ? formatDistanceToNow(new Date(Number(eventLog.blockData.timestamp) * 1000), { addSuffix: true })
              : "N/A",
            txHash: transactionHash,
            blockTimestamp: eventLog.blockData?.timestamp || 0n,
            log: eventLog,
          });
        }
      });

      flatStageUpgradedEvents.forEach((eventLog: any) => {
        const { args, blockHash, transactionHash, logIndex } = eventLog;
        if (args && blockHash && transactionHash && args.user === userAddress && eventLog.blockData) {
          // Ensure blockData exists
          newProcessedEvents.push({
            id: `${transactionHash}-${logIndex}`,
            type: "Upgrade",
            conciseDetails: `Upgraded to ${stageLabels[args.newStage as UserStage] || `Stage ${args.newStage}`}`,
            status: <span className="badge badge-accent badge-sm">Leveled Up</span>,
            time: eventLog.blockData?.timestamp
              ? formatDistanceToNow(new Date(Number(eventLog.blockData.timestamp) * 1000), { addSuffix: true })
              : "N/A",
            txHash: transactionHash,
            blockTimestamp: eventLog.blockData?.timestamp || 0n,
            log: eventLog,
          });
        }
      });

      flatTokensPurchasedEvents.forEach((eventLog: any) => {
        const { args, blockHash, transactionHash, logIndex } = eventLog;
        console.log("[RecentActivity] Processing TokensPurchased event log:", eventLog);
        console.log("[RecentActivity] Comparing args.buyer:", args?.buyer, "with userAddress:", userAddress);
        if (args && blockHash && transactionHash && args.buyer === userAddress && eventLog.blockData) {
          console.log("[RecentActivity] Match found for TokensPurchased event:", eventLog);
          // Ensure blockData exists
          newProcessedEvents.push({
            id: `${transactionHash}-${logIndex}`,
            type: "Buy",
            conciseDetails: `Bought ${formatEther(args.swapTokenAmount || 0n)} ${dgTokenSymbol || "Tokens"}`,
            amount: `+${formatEther(args.swapTokenAmount || 0n)} ${dgTokenSymbol || ""}`,
            status: <span className="badge badge-success badge-sm">Complete</span>,
            time: eventLog.blockData?.timestamp
              ? formatDistanceToNow(new Date(Number(eventLog.blockData.timestamp) * 1000), { addSuffix: true })
              : "N/A",
            txHash: transactionHash,
            blockTimestamp: eventLog.blockData?.timestamp || 0n,
            log: eventLog,
          });
        }
      });

      flatTokensSoldEvents.forEach((eventLog: any) => {
        const { args, blockHash, transactionHash, logIndex } = eventLog;
        if (args && blockHash && transactionHash && args.seller === userAddress && eventLog.blockData) {
          // Ensure blockData exists
          newProcessedEvents.push({
            id: `${transactionHash}-${logIndex}`,
            type: "Sell",
            conciseDetails: `Sold ${formatEther(args.swapTokenAmount || 0n)} ${dgTokenSymbol || "Tokens"}`,
            amount: `-${formatEther(args.swapTokenAmount || 0n)} ${dgTokenSymbol || ""}`,
            status: <span className="badge badge-error badge-sm">Complete</span>,
            time: eventLog.blockData?.timestamp
              ? formatDistanceToNow(new Date(Number(eventLog.blockData.timestamp) * 1000), { addSuffix: true })
              : "N/A",
            txHash: transactionHash,
            blockTimestamp: eventLog.blockData?.timestamp || 0n,
            log: eventLog,
          });
        }
      });

      // Sort events by block timestamp descending
      newProcessedEvents.sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp));

      const limitedEvents = newProcessedEvents.slice(0, 10);
      console.log("[RecentActivity] Processed and limited events:", limitedEvents);

      setAllProcessedEvents(limitedEvents);
      setIsLoading(false);
      console.log("[RecentActivity] Finished processEvents.");
    };

    if (userAddress) {
      processEvents();
    } else {
      setAllProcessedEvents([]); // Clear events if no user address
      setIsLoading(false);
    }
  }, [
    userAddress,
    litEventsData,
    stageUpgradedEventsData,
    tokensPurchasedEventsData,
    tokensSoldEventsData,
    isLoadingLit,
    isLoadingStageUpgraded,
    isLoadingTokensPurchased,
    isLoadingTokensSold,
    dgTokenSymbol,
  ]);

  if (!userAddress) {
    return (
      <div className="bg-base-200 p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <p>Please connect your wallet to view activity.</p>
      </div>
    );
  }

  if (isLoading) {
    return <RecentActivitySkeleton />;
  }

  if (allProcessedEvents.length === 0 && !isLoading) {
    return (
      <div className="bg-base-200 p-6 rounded-xl">
        <p>No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="bg-base-200 p-6 rounded-xl">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="min-w-[80px]">Type</th>
              <th className="min-w-[150px]">Amount</th>
              <th className="min-w-[120px]">Status</th>
              <th className="min-w-[150px]">Time</th>
              <th className="min-w-[100px]">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {allProcessedEvents.map(event => (
              <tr key={event.id}>
                <td>
                  <div className="flex items-center font-semibold">{event.type}</div>
                </td>
                <td>{event.amount || "-"}</td>
                <td>{event.status}</td>
                <td>{event.time}</td>
                <td>
                  {chain && (
                    <a
                      href={getBlockExplorerTxLink(chain.id, event.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      View Tx
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
