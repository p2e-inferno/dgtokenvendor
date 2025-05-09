# Message Signing Script

This script allows you to sign a verification message using your private key from your `.env` file.

## Prerequisites

1. Make sure you have a `.env` file in the root of your project with the `DEPLOYER_PRIVATE_KEY_ENCRYPTED` variable set.
2. Ensure all dependencies are installed by running `yarn install` or `npm install`.

## Running the Script

Execute the script with the following command:

```bash
# From the hardhat directory
yarn sign

# OR from the project root
yarn sign
```

## Output

The script will output:

- Your wallet address
- The message being signed
- The signature hash (this is what you need to provide as verification)
- A validation check confirming the signature is valid

## Security Note

This script reads your private key from the encrypted environment variable. Never share your private key or include it in any public repository or communication.
