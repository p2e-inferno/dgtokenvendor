import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * Deploys the MockNFT contract which simulates Unlock Protocol's behavior
 * for testing purposes.
 */
const deployMockNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const developerAddress = "0x23C93C4dD75b55944a58DF4cb345D0C9C6Ab5C4B";
  console.log(`\n📡 Deployer address: ${deployer}`);

  // Deploy MockNFT
  const mockNFT = await deploy("MockNFT", {
    from: deployer,
    args: ["MockUnlock", "MNFT", "https://example.com/nft/"],
    log: true,
    autoMine: true,
  });

  console.log(`\n🔐 MockNFT deployed at: ${mockNFT.address}`);
  const mockNFTContract = await ethers.getContractAt("MockNFT", mockNFT.address);

  console.log(`\n🔑 Minting NFTs to test users...`);
  await mockNFTContract.mint(developerAddress);
  console.log(`✅ Minted NFT to deployer: ${developerAddress}`);


  // Just grant a key to user2 without minting an NFT to demonstrate the grantKey function
  await mockNFTContract.grantKey(developerAddress);
  console.log(`✅ Granted key to user2: ${developerAddress}`);
};

export default deployMockNFT;

// Tags help when using the hardhat-deploy command
deployMockNFT.tags = ["MockNFT"];
