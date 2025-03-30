import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "DGToken" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
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
  const dgToken = await hre.ethers.getContract<Contract>("DGToken", deployer);
  const dgTokenAddress = await dgToken.getAddress();
  const upTokenAddress = "0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187"; // UP token address on base
  const initialExchangeRate = 10;
  const devAddress = "0xca7632327567796e51920f6b16373e92c7823854";
  const ownerAddress = "0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9";

  await deploy("DGTokenVendor", {
    from: deployer,
    // Contract constructor arguments
    args: [upTokenAddress, dgTokenAddress, initialExchangeRate, devAddress],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const dgToken = await hre.ethers.getContract<Contract>("DGToken", deployer);
  //  await dgToken.transfer(dgTokenAddress, hre.ethers.parseEther("1000"));
  const dgTokenVendor = await hre.ethers.getContract<Contract>("DGTokenVendor", deployer);
  await dgTokenVendor.transferOwnership(ownerAddress);
};

export default deployDGToken;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags DGToken
deployDGToken.tags = ["DGTokenVendor"];
