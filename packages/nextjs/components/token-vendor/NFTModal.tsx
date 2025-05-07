import React from "react";
import { WHITELISTED_NFTS } from "./data/whitelistedNFTs";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon, ClockIcon } from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";

interface NFTModalProps {
  nft: (typeof WHITELISTED_NFTS)[0] | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NFTModal: React.FC<NFTModalProps> = ({ nft, isOpen, onClose }) => {
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
            onClick={(e: any) => e.stopPropagation()}
          >
            <button className="btn btn-sm btn-circle absolute right-2 top-2 z-10" onClick={onClose}>
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-64 md:h-auto bg-base-200 flex items-center justify-center p-8">
                <div className="transform transition-transform hover:scale-110">{nft.icon}</div>
              </div>

              <div className="card-body p-6">
                <h2 className="card-title text-2xl text-primary">{nft.name}</h2>

                <div className="flex flex-wrap gap-2 my-2">
                  {nft.renewable !== undefined && (
                    <div className={`badge ${nft.renewable ? "badge-success" : "badge-warning"} gap-1`}>
                      <ArrowPathIcon className="h-3 w-3" />
                      {nft.renewable ? "Renewable" : "Non-Renewable"}
                    </div>
                  )}
                  {nft.duration && (
                    <div className="badge badge-info gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {nft.duration}
                    </div>
                  )}
                </div>

                <div className="divider my-2"></div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-accent">Description</h3>
                    <p className="text-base-content/80">{nft.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-accent">How to Obtain</h3>
                    <p className="text-base-content/80 mb-4">{nft.obtainMethod}</p>

                    {nft.canBePurchased && nft.purchaseLink && (
                      <a
                        href={nft.purchaseLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary w-full"
                        onClick={e => {
                          e.stopPropagation();
                          // Prevent the modal from closing when clicking the button
                          window.open(nft.purchaseLink, "_blank", "noopener,noreferrer");
                          e.preventDefault();
                        }}
                      >
                        Purchase NFT
                      </a>
                    )}
                  </div>

                  <div className="text-xs text-base-content/50">
                    <div className="flex flex-col gap-1">
                      <span>Collection Address:</span>
                      <Address address={nft.collectionAddress} size="sm" format="short" />
                    </div>
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
