import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { GlobeAltIcon, SparklesIcon, TrophyIcon, UserGroupIcon } from "@heroicons/react/24/solid";

// Mock data - replace with actual data from your smart contract
const WHITELISTED_NFTS = [
  {
    id: 1,
    name: "BuidlGuidl Access NFT",
    icon: <GlobeAltIcon className="h-24 w-24 text-primary/80" />,
    description:
      "This NFT grants access to the BuidlGuidl community. It can only be earned by completing challenges and contributing to the ecosystem.",
    canBePurchased: false,
    obtainMethod:
      "This NFT cannot be purchased. It is awarded to developers who complete and submit quality projects to the BuidlGuidl program.",
    collectionAddress: "0x1234567890123456789012345678901234567890",
  },
  {
    id: 2,
    name: "Digital Game Supporter",
    icon: <UserGroupIcon className="h-24 w-24 text-secondary/80" />,
    description:
      "Show your support for the Digital Game ecosystem with this NFT collection. Holders get exclusive benefits and early access to features.",
    canBePurchased: true,
    obtainMethod: "Purchase directly from our marketplace for 0.05 ETH. Limited supply of 1000 NFTs.",
    purchaseLink: "https://marketplace.example.com/dg-supporter",
    collectionAddress: "0x2345678901234567890123456789012345678901",
  },
  {
    id: 3,
    name: "Protocol Partners",
    icon: <SparklesIcon className="h-24 w-24 text-accent/80" />,
    description: "Official partnership NFT for collaborators and strategic partners of our protocol.",
    canBePurchased: false,
    obtainMethod:
      "This NFT is only available through official partnerships and collaborations. Contact our team to discuss partnership opportunities.",
    collectionAddress: "0x3456789012345678901234567890123456789012",
  },
  {
    id: 4,
    name: "Early Adopter",
    icon: <TrophyIcon className="h-24 w-24 text-success/80" />,
    description:
      "Recognition for the earliest supporters of our platform. These NFTs were distributed during our beta phase.",
    canBePurchased: false,
    obtainMethod:
      "This was a limited collection distributed to early users. You may find some available on secondary markets.",
    collectionAddress: "0x4567890123456789012345678901234567890123",
  },
];

interface NFTCardProps {
  nft: (typeof WHITELISTED_NFTS)[0];
  onClick: () => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onClick }) => {
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
        <div className="card-actions justify-end mt-2">
          <span className={`badge ${nft.canBePurchased ? "badge-primary" : "badge-secondary"}`}>
            {nft.canBePurchased ? "Purchasable" : "Exclusive"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

interface NFTModalProps {
  nft: (typeof WHITELISTED_NFTS)[0] | null;
  isOpen: boolean;
  onClose: () => void;
}

const NFTModal: React.FC<NFTModalProps> = ({ nft, isOpen, onClose }) => {
  if (!nft) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card bg-base-100 shadow-2xl w-full max-w-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="btn btn-sm btn-circle absolute right-2 top-2 z-10" onClick={onClose}>
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative h-64 md:h-auto bg-base-200 flex items-center justify-center p-8">
                <div className="transform transition-transform hover:scale-110">{nft.icon}</div>
              </div>

              <div className="card-body p-6">
                <h2 className="card-title text-2xl text-primary">{nft.name}</h2>

                <div className="divider my-2"></div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-accent">Description</h3>
                    <p className="text-base-content/80">{nft.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-accent">How to Obtain</h3>
                    <p className="text-base-content/80 mb-4">{nft.obtainMethod}</p>

                    {nft.canBePurchased && <button className="btn btn-primary w-full">Purchase NFT</button>}
                  </div>

                  <div className="text-xs text-base-content/50">
                    <p>Collection Address: {nft.collectionAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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
