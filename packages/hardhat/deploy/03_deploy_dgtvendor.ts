import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { devAddress, councilAddress } from "./02_deploy_digitoken";
/**
 * Deploys a contract named "DGToken" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployDGToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const dgToken = await hre.ethers.getContract<Contract>("DGToken", deployer);
  const dgTokenAddress = await dgToken.getAddress();
  const initialExchangeRate = 10;
  const timelockAddress = "0xB34567C4cA697b39F72e1a8478f285329A98ed1b"; // Unlock DAO treasury (timelock) on base
  const upTokenAddress = "0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187"; // UP token address on base

  const initialWhitelistedCollections = [
    "0x9bf35b6750ad9ff45c880b36234c2b14570edb34", // P2E INFERNO IGNITION
    "0xa9ec9e40200592fa3debcaa91fec23b181dbbe05", // DG Nation
    "0x37cb4167d9d9fd5748d202da119d5e9a7d31b8d5", // DGToken Vendor Sponsor
    "0x31152a3ead4f60ce3caeadfccc627360872e3a6a", // DGToken Vendor Supporter
    "0xfd37cf2317fa16db3aafea226d20295bfbf8da98", // DG Nation Tourist
    "0xe34900ace360310ce4e12a5a6ad586dee445c703", // DGToken CEx
  ];

  await deploy("DGTokenVendor", {
    from: deployer,
    args: [upTokenAddress, dgTokenAddress, initialExchangeRate, devAddress, councilAddress],
    log: true,
    autoMine: true,
  });

  // Initialize the application
  const dgTokenVendor = await hre.ethers.getContract<Contract>("DGTokenVendor", deployer);
  await dgTokenVendor.initializeWhitelistedCollections(initialWhitelistedCollections);
  await dgTokenVendor.transferOwnership(timelockAddress);
};

export default deployDGToken;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags DGToken
deployDGToken.tags = ["DGTokenVendor"];
