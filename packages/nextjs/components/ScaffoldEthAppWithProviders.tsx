"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

// Lazy load the PrivyProvider to prevent requiring it when not configured
const LazyPrivyProvider = lazy(() =>
  import("~~/components/privy/PrivyProvider").then(module => ({
    default: module.default,
  })),
);

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className={`flex flex-col min-h-screen font-space-grotesk`}>
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  const [isPrivyEnabled, setIsPrivyEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if Privy is enabled by environment variable
    if (typeof window !== "undefined") {
      const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
      setIsPrivyEnabled(privyAppId != null && privyAppId !== "your-privy-app-id");
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar height="3px" color="#2299dd" />

        {isPrivyEnabled ? (
          <Suspense
            fallback={
              <RainbowKitProvider
                avatar={BlockieAvatar}
                theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
              >
                <ScaffoldEthApp>{children}</ScaffoldEthApp>
              </RainbowKitProvider>
            }
          >
            <LazyPrivyProvider>
              <RainbowKitProvider
                avatar={BlockieAvatar}
                theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
              >
                <ScaffoldEthApp>{children}</ScaffoldEthApp>
              </RainbowKitProvider>
            </LazyPrivyProvider>
          </Suspense>
        ) : (
          <RainbowKitProvider
            avatar={BlockieAvatar}
            theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
          >
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
          </RainbowKitProvider>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
