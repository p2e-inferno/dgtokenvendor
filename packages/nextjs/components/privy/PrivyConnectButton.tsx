"use client";

import { useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { Address } from "viem";
import { Balance } from "~~/components/scaffold-eth/Balance";
import { usePrivyWallet } from "~~/hooks/privy/usePrivyWallet";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Privy Connect Button designed to look and function like the RainbowKit button
 */
export const PrivyConnectButton = () => {
  const { login } = usePrivy();
  const { address, activeWallet, isConnected, ready } = usePrivyWallet();
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const blockExplorerAddressLink = address ? getBlockExplorerAddressLink(targetNetwork, address as Address) : undefined;

  const chainName = activeWallet?.chain?.name || targetNetwork.name;

  if (!ready) {
    return <div className="btn btn-primary btn-sm animate-pulse">Loading...</div>;
  }

  if (!isConnected) {
    return (
      <button className="btn btn-primary btn-sm" onClick={login} type="button">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center mr-1">
        <Balance address={address as Address} className="min-h-0 h-auto" />
        <span className="text-xs" style={{ color: networkColor }}>
          {chainName}
        </span>
      </div>

      {/* Address display with dropdown */}
      <div className="dropdown dropdown-end">
        <label
          tabIndex={0}
          className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md dropdown-toggle gap-0 !h-auto"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center gap-1">
            <div className="rounded-full bg-base-300 p-2 shadow-md">
              <span className="block h-2 w-2 rounded-full bg-primary" />
            </div>
            <div className="text-xs font-normal">
              <span className="mr-1 font-bold">{address?.substring(0, 6)}</span>
              <span>...</span>
              <span className="ml-1 font-bold">{address?.substring(address.length - 4)}</span>
            </div>
          </div>
        </label>

        {isDropdownOpen && (
          <ul
            tabIndex={0}
            className="dropdown-content menu z-[2] p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
          >
            <li>
              {blockExplorerAddressLink && (
                <Link href={blockExplorerAddressLink} target="_blank" rel="noopener noreferrer">
                  View on Block Explorer
                </Link>
              )}
            </li>
            <li>
              <button
                className="menu-item text-error"
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  localStorage.removeItem("connectedWalletType");
                  window.location.reload();
                }}
              >
                Disconnect
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};
