import { LightUpCard } from "./LightUpCard";
import { UpgradeStageCard } from "./UpgradeStageCard";

interface PowerUpActionsCardProps {
  userStage: number;
  userPoints: number;
  userFuel: number;
  burnAmount: string;
  nextStageLabel: string | null;
  nextStageConfig: {
    upgradePointsThreshold: bigint;
    upgradeFuelThreshold: bigint;
  } | null;
  canUpgrade: boolean;
  tokenSymbol?: string;
}

export const PowerUpActionsCard = ({
  userStage,
  userPoints,
  userFuel,
  burnAmount,
  nextStageLabel,
  nextStageConfig,
  canUpgrade,
}: PowerUpActionsCardProps) => {
  return (
    <div className="card bg-base-200 shadow-xl border border-secondary/30">
      <div className="card-body">
        <h2 className="card-title text-secondary">Power Up Actions</h2>

        <div className="space-y-4 mt-4">
          {/* Light Up Action */}
          <LightUpCard burnAmount={burnAmount} />

          {/* Upgrade Stage Action */}
          <UpgradeStageCard
            userStage={userStage}
            userPoints={userPoints}
            userFuel={userFuel}
            nextStageLabel={nextStageLabel}
            nextStageConfig={nextStageConfig}
            canUpgrade={canUpgrade}
          />
        </div>
      </div>
    </div>
  );
};
