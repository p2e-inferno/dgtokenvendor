import React from "react";
import { useAccount } from "wagmi";
import { BoltIcon, StarIcon } from "@heroicons/react/24/solid";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const UserPointsFuelWidget = () => {
  const { address, isConnected } = useAccount();
  const { data: userState } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getUserState",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  const points = userState?.points ? Number(userState.points) : 0;
  const fuelPercentage = userState?.fuel ? Number(userState.fuel) : 0;

  if (!isConnected) return null;

  return (
    <div className="flex items-center bg-base-200 rounded-xl px-4 py-2 mx-2 pointer-events-auto shadow-md border border-accent/20">
      <div className="flex items-center mr-4" title="User Points">
        <StarIcon className="h-5 w-5 text-accent mr-1" />
        <span className="font-bold text-accent">{points}</span>
        <span className="text-xs ml-1 text-base-content/70">PTS</span>
      </div>

      <div className="flex items-center" title={`Fuel: ${fuelPercentage}%`}>
        <BoltIcon className="h-5 w-5 text-primary ml-1" />
        <span className="font-bold text-accent">{fuelPercentage}</span>
      </div>
      <div>
        <span className="text-xs ml-1 text-base-content/70">Fuel</span>
      </div>
    </div>
  );
};
