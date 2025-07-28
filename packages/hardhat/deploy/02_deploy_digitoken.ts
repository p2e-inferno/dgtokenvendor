import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "DGToken" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */

export const devAddress = "0xE11Cd5244DE68D90755a1d142Ab446A4D17cDC10"; // dreadgang.eth
export const councilAddress = "0x167e7497191346211dBC6e9f64c9A736eC84C689"; // Multisig on base

const deployDGToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const initialSupply = 1000000000;

  await deploy("DGToken", {
    from: deployer,
    args: [councilAddress, devAddress, initialSupply],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  // const yourToken = await hre.ethers.getContract<Contract>("DGToken", deployer);
};

export default deployDGToken;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags DGToken
deployDGToken.tags = ["DGToken"];
