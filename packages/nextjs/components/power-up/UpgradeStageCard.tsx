import React, { useState } from "react";
import { ArrowUpCircleIcon, BoltIcon, StarIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth/notification";

interface UpgradeStageCardProps {
  userStage: number;
  userPoints: number;
  userFuel: number;
  nextStageLabel: string | null;
  nextStageConfig: {
    upgradePointsThreshold: bigint;
    upgradeFuelThreshold: bigint;
  } | null;
  canUpgrade: boolean;
}

export const UpgradeStageCard = ({
  userStage,
  userPoints,
  userFuel,
  nextStageLabel,
  nextStageConfig,
  canUpgrade,
}: UpgradeStageCardProps) => {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const { writeContractAsync: upgradeStage } = useScaffoldWriteContract("DGTokenVendor");

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeStage({
        functionName: "upgradeStage",
      });
      notification.success(`Successfully upgraded to ${nextStageLabel}!`);
      return true;
    } catch (err) {
      console.error("Error upgrading stage:", err);
      notification.error("Failed to upgrade stage");
      return false;
    } finally {
      setIsUpgrading(false);
    }
  };

  // If at max stage, show the congratulations message
  if (userStage === 2) {
    return (
      <div className="bg-base-100 rounded-box p-4 text-center">
        <TrophyIcon className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
        <h3 className="font-bold text-xl mb-1">Maximum Stage Reached!</h3>
        <p className="text-sm text-base-content/70">
          Congratulations! You&apos;ve reached the OG status, the highest trader level.
        </p>
      </div>
    );
  }

  // Otherwise show the upgrade option
  return (
    <div className="bg-base-100 rounded-box p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold flex items-center">
          <ArrowUpCircleIcon className="h-5 w-5 text-secondary mr-2" />
          Upgrade to {nextStageLabel}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-base-200 rounded p-2 text-center">
          <div className="flex items-center justify-center">
            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm">
              {userPoints}/{nextStageConfig ? Number(nextStageConfig.upgradePointsThreshold) : 0} Points
            </span>
          </div>
        </div>
        <div className="bg-base-200 rounded p-2 text-center">
          <div className="flex items-center justify-center">
            <BoltIcon className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-sm">
              {userFuel}/{nextStageConfig ? Number(nextStageConfig.upgradeFuelThreshold) : 0} Fuel
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleUpgrade}
        disabled={!canUpgrade || isUpgrading}
        className={`btn btn-sm w-full ${canUpgrade ? "btn-accent" : "btn-disabled"}`}
      >
        {isUpgrading ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            Upgrading...
          </>
        ) : canUpgrade ? (
          "Upgrade Now"
        ) : (
          "Requirements Not Met"
        )}
      </button>
    </div>
  );
};
