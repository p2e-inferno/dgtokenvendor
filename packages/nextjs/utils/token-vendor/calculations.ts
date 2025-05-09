import { TokenAction } from "~~/hooks/useTokenTransaction";

/**
 * Calculates the expected token amount after applying fees
 *
 * @param action - "buy" or "sell" transaction type
 * @param amount - Amount of tokens to convert (input amount)
 * @param exchangeRate - Current exchange rate
 * @param feeConfig - Fee configuration object containing buyFeeBps and sellFeeBps
 * @returns Formatted string representation of the amount after conversion and fees
 */
export const calculateTokenConversion = (
  action: TokenAction,
  amount: string,
  exchangeRate: bigint | undefined,
  feeConfig: { buyFeeBps: bigint; sellFeeBps: bigint } | undefined,
): string => {
  if (!amount || !exchangeRate || !feeConfig) return "0";

  const inputAmount = Number(amount);
  const rate = Number(exchangeRate);

  if (inputAmount <= 0 || rate <= 0) return "0";

  if (action === "buy") {
    // For buy: Calculate DG tokens received when spending UnlockProtocolToken
    // Formula: (amount - fee) * exchangeRate
    const fee = (inputAmount * Number(feeConfig.buyFeeBps)) / 10000;
    const netAmount = inputAmount - fee;
    const tokensReceived = netAmount * rate;
    return tokensReceived.toFixed(6);
  } else {
    // For sell: Calculate UnlockProtocolToken received when selling DG tokens
    // Formula: (amount / exchangeRate) - fee
    const tokenAmount = inputAmount / rate;
    const fee = (tokenAmount * Number(feeConfig.sellFeeBps)) / 10000;
    const netReturn = tokenAmount - fee;
    return netReturn.toFixed(6);
  }
};
