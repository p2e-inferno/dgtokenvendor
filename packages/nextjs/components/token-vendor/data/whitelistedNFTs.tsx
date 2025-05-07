import {
  CurrencyDollarIcon,
  GlobeAltIcon,
  MapIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

export const WHITELISTED_NFTS = [
  {
    id: 1,
    name: "P2E INFERNO IGNITION",
    icon: <TrophyIcon className="h-24 w-24 text-success/80" />,
    description:
      "Awarded for successfully completing the Infernal Sparks Bootcamp — A 4-week onboarding journey into the P2E Inferno ecosystem.",
    canBePurchased: false,
    renewable: false,
    duration: "30 Days",
    obtainMethod:
      "This NFT cannot be purchased. It is awarded to participants who complete all milestones in the Infernal Sparks Bootcamp.",
    collectionAddress: "0x9bf35b6750ad9ff45c880b36234c2b14570edb34",
  },
  {
    id: 2,
    name: "DG Nation",
    icon: <SparklesIcon className="h-24 w-24 text-accent/80" />,
    description: "The beating heart and flickering flame that keeps the engine of the DGToken Vendor running.",
    canBePurchased: true,
    renewable: true,
    duration: "30 Days",
    obtainMethod:
      "DG Nation NFT is a monthly subscription that grants access to the DGToken Vendor. Purchase below for 10000 DGT",
    purchaseLink: "https://app.unlock-protocol.com/checkout?id=646c0be2-7d09-4db8-9c4f-365eb8a901ac",
    collectionAddress: "0xa9ec9e40200592fa3debcaa91fec23b181dbbe05",
  },
  {
    id: 3,
    name: "DGToken Vendor Sponsor",
    icon: <GlobeAltIcon className="h-24 w-24 text-primary/80" />,
    description:
      "DGToken Vendor Sponsor is a soulbound (non-transferable) NFT for all who desire front-row seats at the foundation providing the fuel for the adventures of DGToken Vendor.",
    canBePurchased: true,
    renewable: true,
    duration: "60 Days",
    obtainMethod: "Purchase below for 20000 UP",
    purchaseLink: "https://app.unlock-protocol.com/checkout?id=409f79e1-2ad0-4772-a625-915ef986320b",
    collectionAddress: "0x37cb4167d9d9fd5748d202da119d5e9a7d31b8d5",
  },
  {
    id: 4,
    name: "DGToken Vendor Supporter",
    icon: <UserGroupIcon className="h-24 w-24 text-secondary/80" />,
    description:
      "Show your support for our Digital Game ecosystem with this NFT collection. Holders get exclusive benefits and early access to features.",
    canBePurchased: true,
    renewable: true,
    duration: "180 Days",
    obtainMethod: "Purchase below for 500 USDC",
    purchaseLink: "https://app.unlock-protocol.com/checkout?id=c03459e1-b216-4279-bb36-a4c1cec1e3dc",
    collectionAddress: "0x31152a3ead4f60ce3caeadfccc627360872e3a6a",
  },
  {
    id: 5,
    name: "DG Nation Tourist",
    icon: <MapIcon className="h-24 w-24 text-secondary/80" />,
    description: "Access pass for short-term visitors of DG Nation looking to explore and experience the frontiers.",
    canBePurchased: true,
    renewable: true,
    duration: "1 Day",
    obtainMethod: "Purchase below for 0.005 ETH",
    purchaseLink: "https://app.unlock-protocol.com/checkout?id=60414e11-283d-4e7e-b94f-85afe5f05081",
    collectionAddress: "0xfd37cf2317fa16db3aafea226d20295bfbf8da98",
  },
  {
    id: 6,
    name: "DGToken CEx",
    icon: <CurrencyDollarIcon className="h-24 w-24 text-secondary/80" />,
    description:
      "DGToken CEx (Centralized Exchange) NFT is designed for long-term players who want to participate as Point Of Sale vendors exchanging DGTokens for fiat.",
    canBePurchased: true,
    renewable: true,
    duration: "365 Days",
    obtainMethod: "Purchase below for 100000 UP",
    purchaseLink: "https://app.unlock-protocol.com/checkout?id=8fba66fd-ce45-4189-8096-b7e5ab262064",
    collectionAddress: "0xe34900ace360310ce4e12a5a6ad586dee445c703",
  },
];
