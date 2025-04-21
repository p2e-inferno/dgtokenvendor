"use client";

import type { NextPage } from "next";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Events: NextPage = () => {
  // Token Transfer Events for DG Token
  const { data: dgTokenTransferEvents, isLoading: isDgTokenEventsLoading } = useScaffoldEventHistory({
    contractName: "DGToken" as const,
    eventName: "Transfer" as const,
    fromBlock: 0n,
  });

  // Token Transfer Events for UP Token
  const { data: upTokenTransferEvents, isLoading: isUpTokenEventsLoading } = useScaffoldEventHistory({
    contractName: "UnlockProtocolToken" as const,
    eventName: "Transfer" as const,
    fromBlock: 0n,
  });

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-primary mb-4">Token Events</h1>
        <p className="text-base-content/70 text-lg">View the history of token transfers on the blockchain.</p>
      </div>

      {/* DG Token Transfer Events */}
      <div className="w-full max-w-6xl mb-12">
        <div className="text-center mb-4">
          <span className="block text-2xl font-bold text-secondary">DG Token Transfers</span>
        </div>
        {isDgTokenEventsLoading ? (
          <div className="flex justify-center items-center mt-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-lg">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="bg-secondary text-secondary-content">From</th>
                  <th className="bg-secondary text-secondary-content">To</th>
                  <th className="bg-secondary text-secondary-content">Amount</th>
                </tr>
              </thead>
              <tbody>
                {!dgTokenTransferEvents || dgTokenTransferEvents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No events found
                    </td>
                  </tr>
                ) : (
                  dgTokenTransferEvents?.map((event: any, index: number) => {
                    const { from, to, value } = event.args || { from: "", to: "", value: 0n };
                    return (
                      <tr key={index}>
                        <td className="text-center">
                          <Address address={from || ""} />
                        </td>
                        <td className="text-center">
                          <Address address={to || ""} />
                        </td>
                        <td>{value ? formatEther(value) : "0"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UP Token Transfer Events */}
      <div className="w-full max-w-6xl">
        <div className="text-center mb-4">
          <span className="block text-2xl font-bold text-primary">UP Token Transfers</span>
        </div>
        {isUpTokenEventsLoading ? (
          <div className="flex justify-center items-center mt-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-lg">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="bg-primary text-primary-content">From</th>
                  <th className="bg-primary text-primary-content">To</th>
                  <th className="bg-primary text-primary-content">Amount</th>
                </tr>
              </thead>
              <tbody>
                {!upTokenTransferEvents || upTokenTransferEvents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No events found
                    </td>
                  </tr>
                ) : (
                  upTokenTransferEvents?.map((event: any, index: number) => {
                    const { from, to, value } = event.args || { from: "", to: "", value: 0n };
                    return (
                      <tr key={index}>
                        <td className="text-center">
                          <Address address={from || ""} />
                        </td>
                        <td className="text-center">
                          <Address address={to || ""} />
                        </td>
                        <td>{value ? formatEther(value) : "0"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
