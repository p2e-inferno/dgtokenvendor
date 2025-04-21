import { toast } from "react-hot-toast";

// Map of error messages to more user-friendly notifications
const errorMessages: { [key: string]: string } = {
  ExceedsMaxWhitelistedCollections: "The maximum number of whitelisted collections has been reached.",
  CollectionAddressNotFound: "Collection address not found in the whitelist.",
  CollectionAlreadyAdded: "This collection is already added to the whitelist.",
  NoValidKeyForUserFound: "You need a valid NFT key to use this feature. Please acquire a key first.",
  TokenTransferFailed: "Token transfer failed. Please check your balance and try again.",
  RateLockStillActive: "Exchange rate is locked for the cooling period. Please try again later.",
  FeeLockStillActive: "Fee rates are locked for the cooling period. Please try again later.",
  InsufficientAllowance: "Insufficient token allowance. Please approve tokens first.",
  ETHTransferFailed: "ETH transfer failed. Please try again.",
  InvalidFeeBPS: "Invalid fee rate proposed.",
  InvalidDevAddress: "Invalid developer address provided.",
  AppChangeCooldownStillActive: "Application settings are locked during the cooldown period.",
  UnauthorizedCaller: "You are not authorized to perform this action.",
};

// Function to parse error message and display a toast notification
export const notifyError = (error: any) => {
  console.error("Error details:", error);
  let errorMessage = "An unknown error occurred";

  // Try to extract the error message from the error object
  if (error?.message) {
    // Check if any known error code exists in the error message
    for (const [errorCode, message] of Object.entries(errorMessages)) {
      if (error.message.includes(errorCode)) {
        errorMessage = message;
        break;
      }
    }
  }

  toast.error(errorMessage, {
    duration: 5000,
    position: "top-center",
    style: {
      background: "var(--error)",
      color: "#fff",
      borderRadius: "1rem",
      padding: "1rem",
    },
  });
};

// Function to show success notification
export const notifySuccess = (message: string) => {
  toast.success(message, {
    duration: 5000,
    position: "top-center",
    style: {
      background: "var(--success)",
      color: "#fff",
      borderRadius: "1rem",
      padding: "1rem",
    },
  });
};

// Function to show info notification
export const notifyInfo = (message: string) => {
  toast.success(message, {
    duration: 5000,
    position: "top-center",
    style: {
      background: "var(--primary)",
      color: "#fff",
      borderRadius: "1rem",
      padding: "1rem",
    },
    icon: "ℹ️",
  });
};
