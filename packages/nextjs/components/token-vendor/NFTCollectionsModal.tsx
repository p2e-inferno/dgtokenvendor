import React from "react";
import { WhitelistedNFTs } from "./WhitelistedNFTs";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface NFTCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NFTCollectionsModal: React.FC<NFTCollectionsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-base-100 p-4 border-b border-base-300 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary">Whitelisted NFT Collections</h2>
              <button className="btn btn-sm btn-circle" onClick={onClose}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-base-content/70 mb-6">
                These NFT collections grant access to our token vendor. Acquire one of these NFTs to use all features of
                the platform.
              </p>

              <WhitelistedNFTs />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
