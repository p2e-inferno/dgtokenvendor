import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, ethers } from "ethers";
import { ownerAddress, devAddress } from "./02_deploy_digitoken";
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
  const upTokenAddress = "0x4231F89f3F88F0346bCF997D54C140596Cc9E1A0"; // DAPPX token deployed on base sepolia
  const initialExchangeRate = 10;
  // const upTokenAddress = "0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187"; // UP token address on base
  // const dgTokenAddress = "0x04A79EA9dAF3F3FbA76e7CF231829f9cbAC8d9f1"; // DG token address on base
  // const ownerAddress = "0xB34567C4cA697b39F72e1a8478f285329A98ed1b"; // Unlock DAO treasury on base

  const initialWhitelistedCollections = [
    "0x269724DEed44Bb4Ed28aF80Beeb25b539AB855aB", // DG Nation
    "0xffd0aa6000f5eb6c60f69676e7daafe3d96884d0", // DG Sponsors
    "0x0c239bd2f6ba2b2657968cc84904391887f6ba2c", // P2E INFERNO Scholars
    "0xf7a0f84a8d164187f2252c2098fb6828c68669ba", // DG DG LPs
    "0x2f2455c5a946b0437265d1705d4a5f730c01f18a", // DG Partners
  ];

  await deploy("DGTokenVendor", {
    from: deployer,
    args: [upTokenAddress, dgTokenAddress, initialExchangeRate, devAddress],
    log: true,
    autoMine: true,
  });

  // Initialize the application
  const dgTokenVendor = await hre.ethers.getContract<Contract>("DGTokenVendor", deployer);
  await dgTokenVendor.initializeWhitelistedCollections(initialWhitelistedCollections);
  await dgTokenVendor.transferOwnership(ownerAddress);
};

export default deployDGToken;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags DGToken
deployDGToken.tags = ["DGTokenVendor"];
