import React from "react";
import { WHITELISTED_NFTS } from "./data/whitelistedNFTs";
import { motion } from "framer-motion";
import { ArrowPathIcon, ClockIcon } from "@heroicons/react/24/solid";

interface NFTCardProps {
  nft: (typeof WHITELISTED_NFTS)[0];
  onClick: () => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, onClick }) => {
  return (
    <motion.div
      className="card bg-base-100 shadow-xl overflow-hidden cursor-pointer hover:shadow-accent/30 transition-shadow"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      <figure className="relative h-48 w-full bg-base-200 flex items-center justify-center">{nft.icon}</figure>
      <div className="card-body p-4">
        <h3 className="card-title text-lg">{nft.name}</h3>
        <p className="text-sm text-base-content/70 truncate">{nft.description}</p>
        <div className="card-actions justify-end mt-2 flex-wrap">
          <span className={`badge ${nft.canBePurchased ? "badge-primary" : "badge-secondary"}`}>
            {nft.canBePurchased ? "Purchasable" : "Exclusive"}
          </span>

          {nft.renewable !== undefined && (
            <span className={`badge ${nft.renewable ? "badge-success" : "badge-warning"} gap-1`}>
              <ArrowPathIcon className="h-3 w-3" />
              {nft.renewable ? "Renewable" : "Non-Renewable"}
            </span>
          )}

          {nft.duration && (
            <span className="badge badge-info gap-1">
              <ClockIcon className="h-3 w-3" />
              {nft.duration}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
