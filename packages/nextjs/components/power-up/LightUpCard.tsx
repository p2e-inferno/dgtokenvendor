import React, { useState } from "react";
import { FireIcon } from "@heroicons/react/24/solid";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useTokenAllowance } from "~~/hooks/useTokenAllowance";
import { notification } from "~~/utils/scaffold-eth/notification";

interface LightUpCardProps {
  burnAmount: string;
  tokenSymbol?: string;
}

export const LightUpCard = ({ burnAmount, tokenSymbol = "DAPPX" }: LightUpCardProps) => {
  const [isLightUpLoading, setIsLightUpLoading] = useState(false);

  const { writeContractAsync: lightUp } = useScaffoldWriteContract("DGTokenVendor");

  const { swapToken, approveSwapToken, hasSufficientSwapTokenAllowance, refreshSwapTokenAllowance } = useTokenAllowance(
    {
      vendorContractName: "DGTokenVendor",
    },
  );

  const hasAllowanceForBurnAmount = hasSufficientSwapTokenAllowance(burnAmount);

  const handleApproveTokens = async () => {
    if (burnAmount && parseFloat(burnAmount) > 0) {
      await approveSwapToken();
      await refreshSwapTokenAllowance();
    }
  };

  const handleLightUpAction = async () => {
    setIsLightUpLoading(true);
    try {
      await lightUp({
        functionName: "lightUp",
      });
      notification.success("Successfully lit up and increased fuel!");
      await refreshSwapTokenAllowance();
      return true;
    } catch (err) {
      console.error("Error lighting up:", err);
      notification.error("Failed to light up");
      return false;
    } finally {
      setIsLightUpLoading(false);
    }
  };

  const isDisabled = swapToken.isApproving || isLightUpLoading;
  const showApproveButton = !hasAllowanceForBurnAmount && !!burnAmount && parseFloat(burnAmount) > 0;

  return (
    <div className="bg-base-100 rounded-box p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold flex items-center">
          <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
          Light Up
        </h3>
        <span className="text-sm bg-secondary/20 text-secondary rounded-full px-3 py-1">
          Burns {burnAmount} {tokenSymbol}
        </span>
      </div>
      <p className="text-sm text-base-content/70 mb-3">
        Burn tokens to increase your fuel. Higher fuel allows for larger daily sell limits.
      </p>

      <div className="flex gap-2">
        {showApproveButton && (
          <button
            className={`btn flex-1 btn-primary ${swapToken.isApproving ? "loading" : ""}`}
            onClick={handleApproveTokens}
            disabled={isDisabled || swapToken.isApproving}
          >
            {swapToken.isApproving ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Approving...
              </>
            ) : (
              `Approve ${tokenSymbol}`
            )}
          </button>
        )}
        <button
          className={`btn flex-1 btn-secondary`}
          onClick={handleLightUpAction}
          disabled={!hasAllowanceForBurnAmount || isDisabled || !burnAmount || parseFloat(burnAmount) <= 0}
        >
          {isLightUpLoading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Lighting Up...
            </>
          ) : (
            "Light Up"
          )}
        </button>
      </div>
    </div>
  );
};
