"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PowerUpActionsCard, StageBenefitsSection, UserStatusCard } from "./index";
import { useAccount } from "wagmi";
import { FireIcon, SparklesIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

enum UserStage {
  PLEB = 0,
  HUSTLER = 1,
  OG = 2,
}

interface StageConfig {
  burnAmount: bigint;
  upgradePointsThreshold: bigint;
  upgradeFuelThreshold: bigint;
  fuelRate: bigint;
  pointsAwarded: bigint;
  qualifyingBuyThreshold: bigint;
  maxSellBps: bigint;
  dailyLimitMultiplier: bigint;
}

const PowerUpPage = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);

  // Get token symbols
  const { data: dgTokenSymbol } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "symbol",
  });

  // Get user state and stage configs
  const { data: userState } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getUserState",
    args: [address],
  });

  const { data: plebConfig } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getStageConfig",
    args: [UserStage.PLEB],
  });

  const { data: hustlerConfig } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getStageConfig",
    args: [UserStage.HUSTLER],
  });

  const { data: ogConfig } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getStageConfig",
    args: [UserStage.OG],
  });

  // Format token amounts for display
  const formatTokenAmount = (amount: bigint | undefined): string => {
    if (!amount) return "0";
    return (Number(amount) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  useEffect(() => {
    if (userState && plebConfig && hustlerConfig && ogConfig) {
      setLoading(false);
    }
  }, [userState, plebConfig, hustlerConfig, ogConfig]);

  const getCurrentStageLabel = () => {
    if (!userState) return "UNKNOWN";
    switch (userState.stage) {
      case UserStage.PLEB:
        return "PLEB";
      case UserStage.HUSTLER:
        return "HUSTLER";
      case UserStage.OG:
        return "OG";
      default:
        return "UNKNOWN";
    }
  };

  const getNextStageConfig = () => {
    if (!userState) return null;
    if (userState.stage === UserStage.PLEB) return hustlerConfig as StageConfig;
    if (userState.stage === UserStage.HUSTLER) return ogConfig as StageConfig;
    return null;
  };

  const getStageIcon = (stage: number | undefined) => {
    switch (stage) {
      case UserStage.PLEB:
        return <SparklesIcon className="h-8 w-8 text-blue-400" />;
      case UserStage.HUSTLER:
        return <FireIcon className="h-8 w-8 text-orange-500" />;
      case UserStage.OG:
        return <TrophyIcon className="h-8 w-8 text-yellow-500" />;
      default:
        return null;
    }
  };

  const nextStageConfig = getNextStageConfig();
  const userPoints = userState ? Number(userState.points) : 0;
  const userFuel = userState ? Number(userState.fuel) : 0;
  const currentStage = userState?.stage;

  const canUpgrade =
    nextStageConfig &&
    userPoints >= Number(nextStageConfig.upgradePointsThreshold) &&
    userFuel >= Number(nextStageConfig.upgradeFuelThreshold);

  const nextStageLabel = currentStage === UserStage.PLEB ? "HUSTLER" : currentStage === UserStage.HUSTLER ? "OG" : null;

  const getBurnAmount = () => {
    if (!userState) return "0";

    if (userState.stage === UserStage.PLEB && plebConfig) {
      return formatTokenAmount(plebConfig.burnAmount);
    } else if (userState.stage === UserStage.HUSTLER && hustlerConfig) {
      return formatTokenAmount(hustlerConfig.burnAmount);
    } else if (userState.stage === UserStage.OG && ogConfig) {
      return formatTokenAmount(ogConfig.burnAmount);
    }

    return "0";
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 pt-10 pb-16">
        <div className="alert alert-warning max-w-lg mx-auto">
          <div>
            <h3 className="font-bold">Connect Wallet</h3>
            <div className="text-sm">Please connect your wallet to view your power-up options.</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-10 pb-16 text-center">
        <div className="loading loading-spinner loading-lg text-secondary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-10 pb-16">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Power Up Station</h1>
        <p className="text-lg text-base-content/70">Enhance your trading abilities and climb the ranks</p>
      </div>

      {/* Main content cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
        {/* User Status Card */}
        <UserStatusCard
          userStage={currentStage}
          userPoints={userPoints}
          userFuel={userFuel}
          stageName={getCurrentStageLabel()}
          stageIcon={getStageIcon(currentStage)}
        />

        {/* Power Up Actions Card */}
        <PowerUpActionsCard
          userStage={currentStage || 0}
          userPoints={userPoints}
          userFuel={userFuel}
          burnAmount={getBurnAmount()}
          nextStageLabel={nextStageLabel}
          nextStageConfig={nextStageConfig}
          canUpgrade={!!canUpgrade}
          tokenSymbol={(dgTokenSymbol as string) || "DGT"}
        />
      </div>

      {/* Stage Benefits Section */}
      <StageBenefitsSection
        currentStage={currentStage}
        plebConfig={plebConfig}
        hustlerConfig={hustlerConfig}
        ogConfig={ogConfig}
        formatTokenAmount={formatTokenAmount}
      />

      <div className="text-center mt-8">
        <Link href="/token-vendor" className="btn btn-outline btn-primary">
          Back to Token Vendor
        </Link>
      </div>
    </div>
  );
};

export default PowerUpPage;
