import React from "react";
import { useAccount } from "wagmi";
import { BoltIcon, StarIcon } from "@heroicons/react/24/solid";

export const UserPointsFuelWidget = () => {
  const { isConnected } = useAccount();

  const points = 0;
  const fuelPercentage = 0;

  if (!isConnected) return null;

  return (
    <div className="flex items-center bg-base-200 rounded-xl px-4 py-2 mx-2 pointer-events-auto shadow-md border border-accent/20">
      <div className="flex items-center mr-4">
        <StarIcon className="h-5 w-5 text-accent mr-1" />
        <span className="font-bold text-accent">{points}</span>
        <span className="text-xs ml-1 text-base-content/70">PTS</span>
      </div>

      <div className="flex items-center">
        <BoltIcon className="h-5 w-5 text-primary ml-1" />
        <span className="font-bold text-accent">{fuelPercentage}</span>
      </div>
      <div>
        <span className="text-xs ml-1 text-base-content/70">Fuel</span>
      </div>
    </div>
  );
};
