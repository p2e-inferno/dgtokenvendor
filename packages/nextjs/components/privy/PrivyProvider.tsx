"use client";

import { FC, PropsWithChildren, useEffect, useState } from "react";
import { PrivyProvider as PrivyReactProvider } from "@privy-io/react-auth";
import { useTheme } from "next-themes";

/**
 * Privy Provider component that wraps the application
 * This provides embedded wallet capabilities and reduces friction for users
 */
const PrivyProvider: FC<PropsWithChildren> = ({ children }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [appId, setAppId] = useState<string | null>(null);

  // Get app ID from environment variable
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    if (id && id !== "your-privy-app-id") {
      setAppId(id);
    }
  }, []);

  // If no valid app ID is available, just render children without Privy
  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyReactProvider
      appId={appId}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          noPromptOnSignature: true, // Removes approval confirmations for better UX
        },
        // Customize appearance based on theme
        appearance: {
          theme: isDarkMode ? "dark" : "light",
          accentColor: "#2299dd", // Match your app's accent color
        },
        // Use the default chain configuration that Privy handles automatically
        // This works around the privyWalletOverride issue
        loginMethods: ["wallet", "email"],
      }}
    >
      {children}
    </PrivyReactProvider>
  );
};

export default PrivyProvider;
