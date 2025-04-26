"use client";

import { FC, PropsWithChildren } from "react";
import { PrivyProvider as PrivyReactProvider } from "@privy-io/react-auth";
import { useTheme } from "next-themes";

/**
 * Privy Provider component that wraps the application
 * This provides embedded wallet capabilities and reduces friction for users
 */
const PrivyProvider: FC<PropsWithChildren> = ({ children }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // If no valid app ID is available, just render children without Privy
  if (!appId || appId === "your-privy-app-id") {
    console.error("Privy app ID not configured. Add NEXT_PUBLIC_PRIVY_APP_ID to .env");
    return <>{children}</>;
  }

  return (
    <PrivyReactProvider
      appId={appId}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        // Customize appearance based on theme
        appearance: {
          theme: isDarkMode ? "dark" : "light",
          accentColor: "#2299dd", // Match your app's accent color
        },
        // Login methods
        loginMethods: ["wallet", "email", "twitter", "farcaster"],
      }}
    >
      {children}
    </PrivyReactProvider>
  );
};

export default PrivyProvider;
