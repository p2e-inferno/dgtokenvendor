export type TokenAction = "buy" | "sell";
export type TokenContractName = "DGToken" | "DAPPX";
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
