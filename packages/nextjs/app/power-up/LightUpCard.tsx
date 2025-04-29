import React from "react";
import { FireIcon } from "@heroicons/react/24/solid";
import { useLightUpTransaction } from "~~/hooks/useLightUpTransaction";

interface LightUpCardProps {
  burnAmount: string;
  tokenSymbol?: string;
}

export const LightUpCard = ({ burnAmount, tokenSymbol = "DAPPX" }: LightUpCardProps) => {
  const { isApproved, isApprovalLoading, isLightUpLoading, handleApprove, handleLightUp } = useLightUpTransaction({
    tokenContractName: "DAPPX",
    vendorContractName: "DGTokenVendor",
    tokenSymbol,
  });

  const handleApproveTokens = async () => {
    if (burnAmount) {
      await handleApprove(burnAmount);
    }
  };

  const handleLightUpAction = async () => {
    await handleLightUp();
  };

  // Input is disabled if either approval or transaction is in progress
  const isDisabled = isApprovalLoading || isLightUpLoading;

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
        <button
          className={`btn flex-1 ${isApproved ? "btn-disabled" : "btn-primary"}`}
          onClick={handleApproveTokens}
          disabled={isApproved || !burnAmount || isDisabled}
        >
          {isApprovalLoading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Approving...
            </>
          ) : (
            `Approve ${tokenSymbol}`
          )}
        </button>

        <button
          className={`btn flex-1 btn-secondary`}
          onClick={handleLightUpAction}
          disabled={!isApproved || isDisabled}
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
