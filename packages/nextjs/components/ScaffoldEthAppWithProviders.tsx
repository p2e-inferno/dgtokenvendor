"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { WagmiProvider } from "wagmi";
import { ScaffoldEthApp } from "~~/components/ScaffoldEthApp";
import PrivyProvider from "~~/components/privy/PrivyProvider";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <PrivyProvider>
        <QueryClientProvider client={queryClient}>
          <ProgressBar height="3px" color="#2299dd" />
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </QueryClientProvider>
      </PrivyProvider>
    </WagmiProvider>
  );
};
