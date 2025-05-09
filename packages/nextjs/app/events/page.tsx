"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { ClockIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useFromBlockForPeriod } from "~~/hooks/useFromBlockForPeriod";
import { UserStage } from "~~/types/dgtoken-vendor";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

const stageLabels: Record<UserStage, string> = {
  [UserStage.PLEB]: "Pleb",
  [UserStage.HUSTLER]: "Hustler",
  [UserStage.OG]: "OG Trader",
};

// Time period options for filtering events
type TimePeriodKey = "1h" | "1d" | "7d" | "30d";

const TIME_PERIODS: Record<TimePeriodKey, { label: string; value: number }> = {
  "1h": { label: "1 Hour", value: 1 / 24 }, // 1/24 of a day
  "1d": { label: "1 Day", value: 1 },
  "7d": { label: "7 Days", value: 7 },
  "30d": { label: "30 Days", value: 30 },
};

interface ProcessedEvent {
  id: string;
  type: string;
  args: any;
  time: string;
  txHash: string;
  blockTimestamp: bigint;
}

const EVENTS_PER_PAGE = 20;
const DEFAULT_TIME_PERIOD: TimePeriodKey = "1h";

const Events: NextPage = () => {
  const { chain } = useAccount();
  const [timePeriod, setTimePeriod] = useState<TimePeriodKey>(DEFAULT_TIME_PERIOD);
  const { fromBlock, isLoading: isLoadingBlock } = useFromBlockForPeriod(TIME_PERIODS[timePeriod].value);
  const [allEvents, setAllEvents] = useState<ProcessedEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<ProcessedEvent[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");

  // Infinite scroll implementation without external library
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset when time period changes
  useEffect(() => {
    setIsLoading(true);
    setAllEvents([]);
    setDisplayedEvents([]);
    setPage(1);
  }, [timePeriod]);

  // Debug output for the fromBlock
  useEffect(() => {
    if (fromBlock !== 0n) {
      console.log(`[Events] Using fromBlock ${fromBlock} (approximately ${TIME_PERIODS[timePeriod].label} of history)`);
    }
  }, [fromBlock, timePeriod]);

  // Common event configuration
  const commonEventConfig = {
    contractName: "DGTokenVendor" as const,
    fromBlock,
    blockData: true as const,
    transactionData: false as const,
    receiptData: false as const,
    watch: false,
    enabled: !isLoadingBlock,
  };

  // Buy Events (TokensPurchased)
  const { data: buyEventsData, isLoading: isLoadingBuy } = useScaffoldEventHistory({
    ...commonEventConfig,
    eventName: "TokensPurchased" as const,
  });

  // Sell Events (TokensSold)
  const { data: sellEventsData, isLoading: isLoadingSell } = useScaffoldEventHistory({
    ...commonEventConfig,
    eventName: "TokensSold" as const,
  });

  // Light Up Events (Lit)
  const { data: litEventsData, isLoading: isLoadingLit } = useScaffoldEventHistory({
    ...commonEventConfig,
    eventName: "Lit" as const,
  });

  // Upgrade Events (StageUpgraded)
  const { data: upgradeEventsData, isLoading: isLoadingUpgrade } = useScaffoldEventHistory({
    ...commonEventConfig,
    eventName: "StageUpgraded" as const,
  });

  // Check if the loader element is visible
  const handleScroll = useCallback(() => {
    if (!loaderRef.current || !hasMore || isLoading) return;

    const { top } = loaderRef.current.getBoundingClientRect();
    const isVisible = top < window.innerHeight;

    if (isVisible) {
      const nextPage = page + 1;
      const nextEvents = filterEventsByTab(allEvents, activeTab).slice(0, nextPage * EVENTS_PER_PAGE);

      setDisplayedEvents(nextEvents);
      setPage(nextPage);
      setHasMore(nextEvents.length < filterEventsByTab(allEvents, activeTab).length);
    }
  }, [hasMore, isLoading, page, allEvents, activeTab]);

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isLoadingBlock || isLoadingBuy || isLoadingSell || isLoadingLit || isLoadingUpgrade) {
      setIsLoading(true);
      return;
    }

    const processEvents = () => {
      const newProcessedEvents: ProcessedEvent[] = [];

      const getEventArray = (data: any): any[] => {
        return Array.isArray(data) ? data : [];
      };

      // Process buy events
      getEventArray(buyEventsData).forEach((eventLog: any) => {
        const { args, blockHash, transactionHash, logIndex } = eventLog;
        if (args && blockHash && transactionHash && eventLog.blockData) {
          newProcessedEvents.push({
            id: `buy-${transactionHash}-${logIndex}`,
            type: "Buy",
            args,
            time: eventLog.blockData?.timestamp
              ? formatDistanceToNow(new Date(Number(eventLog.blockData.timestamp) * 1000), { addSuffix: true })
              : "N/A",
            txHash: transactionHash,
            blockTimestamp: eventLog.blockData?.timestamp || 0n,
          });
        }
      });

      // Process sell events
      getEventArray(sellEventsData).forEach((eventLog: any) => {
        const { args, blockHash, transactionHash, logIndex } = eventLog;
        if (args && blockHash && transactionHash && eventLog.blockData) {
          newProcessedEvents.push({
            id: `sell-${transactionHash}-${logIndex}`,
            type: "Sell",
            args,
            time: eventLog.blockData?.timestamp
              ? formatDistanceToNow(new Date(Number(eventLog.blockData.timestamp) * 1000), { addSuffix: true })
              : "N/A",
            txHash: transactionHash,
            blockTimestamp: eventLog.blockData?.timestamp || 0n,
          });
        }
      });

      // Process light up events
      getEventArray(litEventsData).forEach((eventLog: any) => {
        const { args, blockHash, transactionHash, logIndex } = eventLog;
        if (args && blockHash && transactionHash && eventLog.blockData) {
          newProcessedEvents.push({
            id: `lit-${transactionHash}-${logIndex}`,
            type: "Light Up",
            args,
            time: eventLog.blockData?.timestamp
              ? formatDistanceToNow(new Date(Number(eventLog.blockData.timestamp) * 1000), { addSuffix: true })
              : "N/A",
            txHash: transactionHash,
            blockTimestamp: eventLog.blockData?.timestamp || 0n,
          });
        }
      });

      // Process upgrade events
      getEventArray(upgradeEventsData).forEach((eventLog: any) => {
        const { args, blockHash, transactionHash, logIndex } = eventLog;
        if (args && blockHash && transactionHash && eventLog.blockData) {
          newProcessedEvents.push({
            id: `upgrade-${transactionHash}-${logIndex}`,
            type: "Upgrade",
            args,
            time: eventLog.blockData?.timestamp
              ? formatDistanceToNow(new Date(Number(eventLog.blockData.timestamp) * 1000), { addSuffix: true })
              : "N/A",
            txHash: transactionHash,
            blockTimestamp: eventLog.blockData?.timestamp || 0n,
          });
        }
      });

      // Sort events by block timestamp descending (newest first)
      newProcessedEvents.sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp));

      setAllEvents(newProcessedEvents);
      setDisplayedEvents(filterEventsByTab(newProcessedEvents, activeTab).slice(0, EVENTS_PER_PAGE));
      setIsLoading(false);
      setHasMore(filterEventsByTab(newProcessedEvents, activeTab).length > EVENTS_PER_PAGE);
    };

    processEvents();
  }, [
    buyEventsData,
    sellEventsData,
    litEventsData,
    upgradeEventsData,
    isLoadingBlock,
    isLoadingBuy,
    isLoadingSell,
    isLoadingLit,
    isLoadingUpgrade,
    activeTab,
  ]);

  // Filter events based on active tab
  const filterEventsByTab = (events: ProcessedEvent[], tab: string): ProcessedEvent[] => {
    if (tab === "All") return events;
    return events.filter(event => event.type === tab);
  };

  // Handle tab change
  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    const filteredEvents = filterEventsByTab(allEvents, tab);
    setDisplayedEvents(filteredEvents.slice(0, EVENTS_PER_PAGE));
    setHasMore(filteredEvents.length > EVENTS_PER_PAGE);
  };

  // Generate block explorer link safely
  const getExplorerLink = (txHash: string) => {
    if (!chain) return "#";
    try {
      return getBlockExplorerTxLink(chain.id, txHash);
    } catch (error) {
      console.error("Error generating block explorer link:", error);
      return "#";
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-primary mb-4">DGTokenVendor Events</h1>
        <p className="text-base-content/70 text-lg px-2">
          View the history of buy, sell, light up, and upgrade events on the vendor contract.
        </p>
      </div>

      {/* Time Period Selector */}
      <div className="w-full max-w-6xl mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-200 p-4 rounded-xl">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-primary mr-2" />
            <span className="font-medium">Time Period:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TIME_PERIODS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setTimePeriod(key as TimePeriodKey)}
                className={`btn btn-sm ${timePeriod === key ? "btn-primary" : "btn-outline"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6 w-full max-w-6xl flex justify-center">
        <a className={`tab ${activeTab === "All" ? "tab-active" : ""}`} onClick={() => changeTab("All")}>
          All
        </a>
        <a className={`tab ${activeTab === "Buy" ? "tab-active" : ""}`} onClick={() => changeTab("Buy")}>
          Buy
        </a>
        <a className={`tab ${activeTab === "Sell" ? "tab-active" : ""}`} onClick={() => changeTab("Sell")}>
          Sell
        </a>
        <a className={`tab ${activeTab === "Light Up" ? "tab-active" : ""}`} onClick={() => changeTab("Light Up")}>
          Lit
        </a>
        <a className={`tab ${activeTab === "Upgrade" ? "tab-active" : ""}`} onClick={() => changeTab("Upgrade")}>
          Upgrade
        </a>
      </div>

      {/* Events Table */}
      <div className="w-full max-w-6xl">
        {isLoading ? (
          <div className="flex justify-center items-center mt-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center p-8 bg-base-200 rounded-lg">
            <p className="text-xl">No events found for the selected time period</p>
            <p className="text-sm text-base-content/70 mt-2">
              Try increasing the time range or switching to a different tab
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto shadow-lg rounded-lg mx-2">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th className="bg-primary text-primary-content">Type</th>
                    <th className="bg-primary text-primary-content">Details</th>
                    <th className="bg-primary text-primary-content">Time</th>
                    <th className="bg-primary text-primary-content">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedEvents.map(event => {
                    let details;

                    switch (event.type) {
                      case "Buy":
                        details = (
                          <>
                            <div>
                              <span className="font-medium">Buyer:</span> <Address address={event.args.buyer} />
                            </div>
                            <div>
                              <span className="font-medium">Amount:</span>{" "}
                              {formatEther(event.args.swapTokenAmount || 0n)} DG
                            </div>
                            <div>
                              <span className="font-medium">Paid:</span> {formatEther(event.args.baseTokenAmount || 0n)}{" "}
                              UnlockProtocolToken
                            </div>
                          </>
                        );
                        break;
                      case "Sell":
                        details = (
                          <>
                            <div>
                              <span className="font-medium">Seller:</span> <Address address={event.args.seller} />
                            </div>
                            <div>
                              <span className="font-medium">Amount:</span>{" "}
                              {formatEther(event.args.swapTokenAmount || 0n)} DG
                            </div>
                            <div>
                              <span className="font-medium">Received:</span>{" "}
                              {formatEther(event.args.baseTokenAmount || 0n)} UnlockProtocolToken
                            </div>
                          </>
                        );
                        break;
                      case "Light Up":
                        details = (
                          <>
                            <div>
                              <span className="font-medium">User:</span> <Address address={event.args.user} />
                            </div>
                            <div>
                              <span className="font-medium">Burned:</span> {formatEther(event.args.burnAmount || 0n)} DG
                            </div>
                            <div>
                              <span className="font-medium">New Fuel:</span> {Number(event.args.newFuel).toString()}
                            </div>
                          </>
                        );
                        break;
                      case "Upgrade":
                        details = (
                          <>
                            <div>
                              <span className="font-medium">User:</span> <Address address={event.args.user} />
                            </div>
                            <div>
                              <span className="font-medium">New Stage:</span>{" "}
                              {stageLabels[event.args.newStage as UserStage] || `Stage ${event.args.newStage}`}
                            </div>
                          </>
                        );
                        break;
                      default:
                        details = <div>Unknown event type</div>;
                    }

                    return (
                      <tr key={event.id}>
                        <td>
                          <div className="font-medium">
                            {event.type === "Buy" && <span className="text-green-600">💰 Buy</span>}
                            {event.type === "Sell" && <span className="text-red-600">💸 Sell</span>}
                            {event.type === "Light Up" && <span className="text-yellow-600">🔥 Light Up</span>}
                            {event.type === "Upgrade" && <span className="text-purple-600">⭐ Upgrade</span>}
                          </div>
                        </td>
                        <td>{details}</td>
                        <td>{event.time}</td>
                        <td>
                          <a
                            href={getExplorerLink(event.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Tx
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div ref={loaderRef} className="flex justify-center items-center py-4 mt-4">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
