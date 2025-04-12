import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "DGToken" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
export const ownerAddress = "0x306677D29De683a6907Bb2A666f8E206e062a689"; // Boxman address -- CHANGE BEFORE LIVE DEPLOYMENT
export const devAddress = "0x306677D29De683a6907Bb2A666f8E206e062a689"; // Boxman address -- CHANGE BEFORE LIVE DEPLOYMENT

const deployDGToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const initialSupply = 160000000;
  // const ownerAddress = "0xB34567C4cA697b39F72e1a8478f285329A98ed1b"; // Unlock DAO treasury (timelock) on base
  // const devAddress = "0xca7632327567796e51920f6b16373e92c7823854"; // Dev address -- CHANGE BEFORE LIVE DEPLOYMENT

  await deploy("DGToken", {
    from: deployer,
    // Contract constructor arguments
    args: [ownerAddress, devAddress, initialSupply],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const yourToken = await hre.ethers.getContract<Contract>("DGToken", deployer);
};

export default deployDGToken;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags DGToken
deployDGToken.tags = ["DGToken"];
