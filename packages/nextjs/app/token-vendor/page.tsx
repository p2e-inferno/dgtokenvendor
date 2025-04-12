"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { AddressInput, IntegerInput } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
// import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";

const TokenVendor: NextPage = () => {
  const [toAddress, setToAddress] = useState("");
  const [tokensToSend, setTokensToSend] = useState("");
  const [tokensToBuy, setTokensToBuy] = useState<string | bigint>("");
  const [isDGTokenApproved, setIsDGTokenApproved] = useState(false);
  const [isUPTokenApproved, setIsUPTokenApproved] = useState(false);
  const [tokensToSell, setTokensToSell] = useState<string>("");

  const { address } = useAccount();
  const { data: dgTokenSymbol } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "symbol",
  });

  const { data: upTokenSymbol } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "symbol",
  });

  const { data: upTokenName } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "name",
  });

  const { data: dgTokenName } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "name",
  });

  const { data: yourDGTokenBalance } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: yourSwapTokenBalance } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: vendorContractData } = useDeployedContractInfo("DGTokenVendor");
  // const { data: unlockContractData } = useDeployedContractInfo("UnlockProtocolToken");
  const { writeContractAsync: writeVendorAsync } = useScaffoldWriteContract("DGTokenVendor");
  const { writeContractAsync: writeDGTokenAsync } = useScaffoldWriteContract("DGToken");
  const { writeContractAsync: writeUnlockTokenAsync } = useScaffoldWriteContract("DAPPX");

  const { data: vendorDGTokenBalance } = useScaffoldReadContract({
    contractName: "DGToken",
    functionName: "balanceOf",
    args: [vendorContractData?.address],
  });

  // const { data: vendorUPTokenBalance } = useScaffoldReadContract({
  //   contractName: "UnlockProtocolToken",
  //   functionName: "balanceOf",
  //   args: [vendorContractData?.address],
  // });

  const { data: dappxToken } = useScaffoldReadContract({
    contractName: "DAPPX",
    functionName: "balanceOf",
    args: [vendorContractData?.address],
  });

  // const { data: vendorEthBalance } = useWatchBalance({ address: vendorContractData?.address });

  const { data: exchangRate } = useScaffoldReadContract({
    contractName: "DGTokenVendor",
    functionName: "getExchangeRate",
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="flex flex-col items-center bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-24 w-full max-w-lg">
          <div className="text-sm text-gray-700">
            Your {dgTokenName} balance:{" "}
            <div className="inline-flex items-center justify-center font-bold">
              {parseFloat(formatEther(yourDGTokenBalance || 0n)).toFixed(4)}
              <span className="font-bold ml-1">{dgTokenSymbol}</span>
            </div>
          </div>
          <div className="text-sm text-yellow-900">
            Your {upTokenName} balance:{" "}
            <div className="inline-flex items-center justify-center font-bold">
              {parseFloat(formatEther(yourSwapTokenBalance || 0n)).toFixed(4)}
              <span className="font-bold ml-1">{upTokenSymbol}</span>
            </div>
          </div>
          {/* Vendor Balances */}
          <hr className="w-full border-secondary my-3" />
          <div>
            Vendor {dgTokenName} balance:{" "}
            <div className="inline-flex items-center justify-center">
              {Number(formatEther(vendorDGTokenBalance || 0n)).toFixed(4)}
              <span className="font-bold ml-1">{dgTokenSymbol}</span>
            </div>
          </div>
          <div>
            Vendor {upTokenName} balance: {Number(formatEther(dappxToken || 0n)).toFixed(4)}
            <span className="font-bold ml-1">{upTokenSymbol}</span>
          </div>
        </div>

        {/* Buy Tokens */}
        <div className="flex flex-col items-center space-y-4 bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-8 w-full max-w-lg">
          <div className="text-xl">Buy {dgTokenName}s</div>
          <div>
            {Number(exchangRate || 0n)} {dgTokenSymbol} per {upTokenSymbol}
          </div>

          <div className="w-full flex flex-col space-y-2">
            <IntegerInput
              placeholder="amount of tokens to buy"
              value={tokensToBuy.toString()}
              onChange={value => setTokensToBuy(value)}
              disableMultiplyBy1e18
            />
          </div>

          <div className="flex gap-4">
            <button
              className={`btn ${isUPTokenApproved ? "btn-disabled" : "btn-secondary"}`}
              onClick={async () => {
                try {
                  await writeUnlockTokenAsync({
                    functionName: "approve",
                    args: [vendorContractData?.address, multiplyTo1e18(tokensToBuy)],
                  });
                  setIsUPTokenApproved(true);
                } catch (err) {
                  console.error("Error calling approve function");
                }
              }}
            >
              Approve Tokens
            </button>
            <button
              className="btn btn-secondary mt-2"
              onClick={async () => {
                try {
                  await writeVendorAsync({
                    functionName: "buyTokens",
                    args: [multiplyTo1e18(tokensToBuy)],
                  });
                } catch (err) {
                  console.error("Error calling buyTokens function");
                }
              }}
            >
              Buy Tokens
            </button>
          </div>
        </div>

        {/* {!!yourDGTokenBalance && (
          <div className="flex flex-col items-center space-y-4 bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-8 w-full max-w-lg">
            <div className="text-xl">Transfer tokens</div>
            <div className="w-full flex flex-col space-y-2">
              <AddressInput placeholder="to address" value={toAddress} onChange={value => setToAddress(value)} />
              <IntegerInput
                placeholder="amount of tokens to send"
                value={tokensToSend}
                onChange={value => setTokensToSend(value as string)}
                disableMultiplyBy1e18
              />
            </div>

            <button
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  await writeDGTokenAsync({
                    functionName: "transfer",
                    args: [toAddress, multiplyTo1e18(tokensToSend)],
                  });
                } catch (err) {
                  console.error("Error calling transfer function");
                }
              }}
            >
              Send Tokens
            </button>
          </div>
        )} */}

        {/* Sell Tokens */}
        {!!yourDGTokenBalance && (
          <div className="flex flex-col items-center space-y-4 bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-8 w-full max-w-lg">
            <div className="text-xl">Sell {dgTokenName}s</div>
            <div>
              {1 / Number(exchangRate || 0n)} {upTokenSymbol} per {dgTokenSymbol} (excluding fees)
            </div>

            <div className="w-full flex flex-col space-y-2">
              <IntegerInput
                placeholder="amount of tokens to sell"
                value={tokensToSell}
                onChange={value => setTokensToSell(value as string)}
                disabled={isDGTokenApproved}
                disableMultiplyBy1e18
              />
            </div>

            <div className="flex gap-4">
              <button
                className={`btn ${isDGTokenApproved ? "btn-disabled" : "btn-secondary"}`}
                onClick={async () => {
                  try {
                    await writeDGTokenAsync({
                      functionName: "approve",
                      args: [vendorContractData?.address, multiplyTo1e18(tokensToSell)],
                    });
                    setIsDGTokenApproved(true);
                  } catch (err) {
                    console.error("Error calling approve function");
                  }
                }}
              >
                Approve Tokens
              </button>

              <button
                className={`btn ${isDGTokenApproved ? "btn-secondary" : "btn-disabled"}`}
                onClick={async () => {
                  try {
                    await writeVendorAsync({ functionName: "sellTokens", args: [multiplyTo1e18(tokensToSell)] });
                    setIsDGTokenApproved(false);
                  } catch (err) {
                    console.error("Error calling sellTokens function");
                  }
                }}
              >
                Sell Tokens
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TokenVendor;
