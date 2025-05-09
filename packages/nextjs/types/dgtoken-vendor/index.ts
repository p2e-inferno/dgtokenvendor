export type TokenAction = "buy" | "sell";
export type TokenContractName = "DGToken" | "UnlockProtocolToken";
export type VendorContractName = "DGTokenVendor";
export enum UserStage {
  PLEB = 0,
  HUSTLER = 1,
  OG = 2,
}
export interface StageConfig {
  burnAmount: bigint;
  upgradePointsThreshold: bigint;
  upgradeFuelThreshold: bigint;
  fuelRate: bigint;
  pointsAwarded: bigint;
  qualifyingBuyThreshold: bigint;
  maxSellBps: bigint;
  dailyLimitMultiplier: bigint;
}
export type TokenType = "baseToken" | "swapToken";
export interface UseLightUpTransactionProps {
  tokenContractName: TokenContractName;
  vendorContractName: VendorContractName;
  tokenSymbol: string;
}
export interface RecentActivityProps {
  userAddress?: string;
  dgTokenSymbol?: string;
  periodDays?: number; // Period in days to look back for events
}
