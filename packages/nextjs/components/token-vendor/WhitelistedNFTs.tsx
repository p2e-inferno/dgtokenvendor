import React, { useState } from "react";
import { NFTCard } from "./NFTCard";
import { NFTModal } from "./NFTModal";
import { WHITELISTED_NFTS } from "./data/whitelistedNFTs";
import { motion } from "framer-motion";

export const WhitelistedNFTs: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<(typeof WHITELISTED_NFTS)[0] | null>(null);

  const handleNFTClick = (nft: (typeof WHITELISTED_NFTS)[0]) => {
    setSelectedNFT(nft);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {WHITELISTED_NFTS.map(nft => (
          <NFTCard key={nft.id} nft={nft} onClick={() => handleNFTClick(nft)} />
        ))}
      </motion.div>

      <NFTModal nft={selectedNFT} isOpen={isOpen} onClose={handleCloseModal} />
    </div>
  );
};
