import { ethers, Wallet } from "ethers";
import * as dotenv from "dotenv";
import { resolve } from "path";
import password from "@inquirer/password";

// The message to sign
const message = "YOUR_MESSAGE_TO_SIGN" 

async function main() {
  // Load environment variables from the root .env file
  dotenv.config({ path: resolve(__dirname, "../../../.env") });

  try {
    // Get the encrypted private key from environment variable
    const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;

    if (!encryptedKey) {
      throw new Error(
        "Encrypted private key not found. Make sure DEPLOYER_PRIVATE_KEY_ENCRYPTED is set in your .env file.",
      );
    }

    // Prompt for password to decrypt the key
    const pass = await password({ message: "Enter your password to decrypt the private key:" });

    // Decrypt the private key
    let wallet: ethers.Wallet | ethers.HDNodeWallet;
    try {
      wallet = await Wallet.fromEncryptedJson(encryptedKey, pass);
    } catch (e) {
      console.log("❌ Failed to decrypt private key. Wrong password?");
      return;
    }

  
    // Sign the message
    const signature = await wallet.signMessage(message);

    console.log("\n====== MESSAGE SIGNING RESULTS ======");
    console.log("Address:", wallet.address);
    console.log("Message:", message);
    console.log("Signature Hash:", signature);
    console.log("=====================================\n");

    // Verify the signature (optional validation step)
    const recoveredAddress = ethers.verifyMessage(message, signature);
    console.log("Signature is valid:", recoveredAddress === wallet.address);
  } catch (error) {
    console.error("Error signing message:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
