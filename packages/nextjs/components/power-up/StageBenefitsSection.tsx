import { StageCard } from "./StageCard";
import { FireIcon, SparklesIcon, TrophyIcon } from "@heroicons/react/24/solid";

enum UserStage {
  PLEB = 0,
  HUSTLER = 1,
  OG = 2,
}

interface StageBenefitsSectionProps {
  currentStage: number | undefined;
  plebConfig: any;
  hustlerConfig: any;
  ogConfig: any;
  formatTokenAmount: (amount: bigint | undefined) => string;
}

export const StageBenefitsSection = ({
  currentStage,
  plebConfig,
  hustlerConfig,
  ogConfig,
  formatTokenAmount,
}: StageBenefitsSectionProps) => {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-4 text-center">Stage Benefits</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PLEB Stage */}
        <StageCard
          name="PLEB"
          icon={<SparklesIcon className="h-6 w-6 mr-2 text-blue-400" />}
          isCurrentStage={currentStage === UserStage.PLEB}
          stageData={plebConfig}
          formatTokenAmount={formatTokenAmount}
        />

        {/* HUSTLER Stage */}
        <StageCard
          name="HUSTLER"
          icon={<FireIcon className="h-6 w-6 mr-2 text-orange-500" />}
          isCurrentStage={currentStage === UserStage.HUSTLER}
          stageData={hustlerConfig}
          formatTokenAmount={formatTokenAmount}
        />

        {/* OG Stage */}
        <StageCard
          name="OG"
          icon={<TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />}
          isCurrentStage={currentStage === UserStage.OG}
          stageData={ogConfig}
          formatTokenAmount={formatTokenAmount}
        />
      </div>
    </div>
  );
};
