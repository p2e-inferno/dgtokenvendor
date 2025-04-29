import React from "react";

interface StageCardProps {
  name: string;
  icon: React.ReactNode;
  isCurrentStage: boolean;
  stageData: {
    burnAmount?: bigint;
    fuelRate?: number | bigint;
    pointsAwarded?: number | bigint;
    qualifyingBuyThreshold?: bigint;
    maxSellBps?: number | bigint;
    upgradePointsThreshold?: bigint;
    upgradeFuelThreshold?: bigint;
  } | null;
  formatTokenAmount: (amount: bigint | undefined) => string;
}

export const StageCard = ({ name, icon, isCurrentStage, stageData, formatTokenAmount }: StageCardProps) => {
  if (!stageData) return null;

  return (
    <div className={`card bg-base-100 shadow-xl border ${isCurrentStage ? "border-primary" : "border-base-300"}`}>
      <div className="card-body">
        <h3 className={`card-title flex items-center ${isCurrentStage ? "text-primary" : ""}`}>
          {icon}
          {name}
        </h3>

        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-base-content/70">Burn Amount:</span>
            <span>{formatTokenAmount(stageData.burnAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-content/70">Fuel Rate:</span>
            <span>+{stageData.fuelRate ? Number(stageData.fuelRate) : 0}/Light</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-content/70">Points Per Buy:</span>
            <span>+{stageData.pointsAwarded ? Number(stageData.pointsAwarded) : 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-content/70">Qualifying Buy:</span>
            <span>{formatTokenAmount(stageData.qualifyingBuyThreshold)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-content/70">Max Sell %:</span>
            <span>{stageData.maxSellBps ? Number(stageData.maxSellBps) / 100 : 0}%</span>
          </div>
          {stageData.upgradePointsThreshold ? (
            <div className="flex justify-between text-sm">
              <span className="text-base-content/70">Upgrade Points Needed:</span>
              <span>{stageData.upgradePointsThreshold ? Number(stageData.upgradePointsThreshold) : 0}</span>
            </div>
          ) : null}
          {stageData.upgradeFuelThreshold ? (
            <div className="flex justify-between text-sm">
              <span className="text-base-content/70">Upgrade Fuel Needed:</span>
              <span>{stageData.upgradeFuelThreshold ? Number(stageData.upgradeFuelThreshold) : 0}</span>
            </div>
          ) : null}
        </div>

        {isCurrentStage && (
          <div className="mt-2 bg-primary/20 text-primary text-sm rounded-lg p-2 text-center">Current Stage</div>
        )}
      </div>
    </div>
  );
};
