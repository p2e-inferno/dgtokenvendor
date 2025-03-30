import hre from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { DGToken, YourToken, DGTokenVendor, MockNFT } from "../typechain-types";

const { ethers } = hre;

describe("🚩 DGTokenVendor Contract Tests", function () {
  // Contract instances
  let dgToken: DGToken;
  let yourToken: YourToken;
  let vendor: DGTokenVendor;
  let mockNFT: MockNFT;

  // Addresses
  let dgTokenAddress: string;
  let yourTokenAddress: string;
  let vendorAddress: string;
  let devAddress: string;

  // Constants
  const INITIAL_EXCHANGE_RATE = 5;
  const DAYS_90 = 90 * 24 * 60 * 60; // 90 days in seconds
  const DAYS_100 = 100 * 24 * 60 * 60; // 100 days in seconds

  // Setup before tests
  before(async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    devAddress = user2.address; // Using user2 as dev address
    console.log("🔑 Owner address:", owner.address);
    console.log("🔑 User1 address:", user1.address);
    console.log("🔑 Dev address:", devAddress);
  });

  // Deploy contracts before each test
  beforeEach(async function () {
    const [owner] = await ethers.getSigners();

    // Deploy DGToken
    const DGTokenFactory = await ethers.getContractFactory("DGToken");
    dgToken = (await DGTokenFactory.deploy(
      owner.address,
      devAddress,
      1000000n * BigInt(1e18), // 1 million tokens in wei
    )) as DGToken;
    dgTokenAddress = await dgToken.getAddress();
    console.log("📝 DGToken deployed at:", dgTokenAddress);

    // Deploy YourToken
    const YourTokenFactory = await ethers.getContractFactory("YourToken");
    yourToken = (await YourTokenFactory.deploy()) as YourToken;
    yourTokenAddress = await yourToken.getAddress();
    console.log("📝 YourToken deployed at:", yourTokenAddress);

    // Deploy MockNFT
    const MockNFTFactory = await ethers.getContractFactory("MockNFT");
    mockNFT = (await MockNFTFactory.deploy("MockUnlock", "MNFT", "https://example.com/nft/")) as MockNFT;
    const mockNFTAddress = await mockNFT.getAddress();
    console.log("📝 MockNFT deployed at:", mockNFTAddress);

    // Deploy DGTokenVendor
    const DGTokenVendorFactory = await ethers.getContractFactory("DGTokenVendor");
    vendor = (await DGTokenVendorFactory.deploy(
      dgTokenAddress,
      yourTokenAddress,
      INITIAL_EXCHANGE_RATE,
      devAddress,
    )) as DGTokenVendor;
    vendorAddress = await vendor.getAddress();
    console.log("📝 DGTokenVendor deployed at:", vendorAddress);

    // Transfer tokens to vendor
    // Get balances first to check how much we can transfer
    const dgTokenBalance = await dgToken.balanceOf(owner.address);
    await dgToken
      .connect(owner)
      .transfer(
        vendorAddress,
        dgTokenBalance > ethers.parseEther("10000") ? ethers.parseEther("10000") : dgTokenBalance / 2n,
      );

    const yourTokenBalance = await yourToken.balanceOf(owner.address);
    if (yourTokenBalance > 0n) {
      await yourToken
        .connect(owner)
        .transfer(
          vendorAddress,
          yourTokenBalance > ethers.parseEther("50000") ? ethers.parseEther("50000") : yourTokenBalance / 2n,
        );
    }

    // Add MockNFT to whitelist
    await vendor.addWhitelistedCollection(mockNFTAddress);
  });

  // Helper function to give a user a valid key using the MockNFT contract
  async function giveUserValidKey(userAddress: string): Promise<void> {
    await mockNFT.grantKey(userAddress);
  }

  describe("🧪 Constructor and Initialization", function () {
    it("Should set tokens correctly", async function () {
      const baseToken = await vendor.baseToken();
      const swapToken = await vendor.swapToken();
      expect(baseToken).to.equal(dgTokenAddress);
      expect(swapToken).to.equal(yourTokenAddress);
    });

    it("Should set dev address correctly", async function () {
      expect(await vendor.DEV_ADDRESS()).to.equal(devAddress);
    });

    it("Should set initial exchange rate correctly", async function () {
      const exchangeRate = await vendor.exchangeRate();
      expect(exchangeRate).to.equal(INITIAL_EXCHANGE_RATE);
    });

    it("Should set initial fee rates correctly", async function () {
      const buyFeeBPS = await vendor.buyFeeBPS();
      const sellFeeBPS = await vendor.sellFeeBPS();
      expect(buyFeeBPS).to.equal(100); // 1%
      expect(sellFeeBPS).to.equal(200); // 2%
    });

    it("Should have MockNFT in whitelist", async function () {
      const collections = await vendor.getWhitelistedCollections();
      const mockNFTAddress = await mockNFT.getAddress();
      expect(collections).to.include(mockNFTAddress);
    });
  });

  describe("🧪 Whitelist Management", function () {
    it("Should allow owner to add a collection", async function () {
      const [owner, user1] = await ethers.getSigners();
      const MockNFTFactory = await ethers.getContractFactory("MockNFT");
      const anotherNFT = await MockNFTFactory.deploy("AnotherNFT", "ANFT", "https://example.com/anft/");
      const anotherNFTAddress = await anotherNFT.getAddress();

      await vendor.addWhitelistedCollection(anotherNFTAddress);

      const collections = await vendor.getWhitelistedCollections();
      expect(collections).to.include(anotherNFTAddress);
    });

    it("Should not allow non-owner to add a collection", async function () {
      const [owner, user1] = await ethers.getSigners();
      const MockNFTFactory = await ethers.getContractFactory("MockNFT");
      const anotherNFT = await MockNFTFactory.deploy("AnotherNFT", "ANFT", "https://example.com/anft/");
      const anotherNFTAddress = await anotherNFT.getAddress();

      await expect(vendor.connect(user1).addWhitelistedCollection(anotherNFTAddress)).to.be.revertedWithCustomError(
        vendor,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should not allow adding a collection that's already whitelisted", async function () {
      const mockNFTAddress = await mockNFT.getAddress();
      await expect(vendor.addWhitelistedCollection(mockNFTAddress)).to.be.revertedWithCustomError(
        vendor,
        "CollectionAlreadyAdded",
      );
    });

    it("Should allow batch adding collections", async function () {
      const MockNFTFactory = await ethers.getContractFactory("MockNFT");
      const nft1 = await MockNFTFactory.deploy("NFT1", "NFT1", "https://example.com/nft1/");
      const nft2 = await MockNFTFactory.deploy("NFT2", "NFT2", "https://example.com/nft2/");

      await vendor.batchAddWhitelistedCollections([await nft1.getAddress(), await nft2.getAddress()]);

      const collections = await vendor.getWhitelistedCollections();
      expect(collections).to.include(await nft1.getAddress());
      expect(collections).to.include(await nft2.getAddress());
    });

    it("Should not allow exceeding max whitelist size", async function () {
      const MockNFTFactory = await ethers.getContractFactory("MockNFT");
      const nfts = [];

      // Create 11 NFTs (max is 10, and we already have 1)
      for (let i = 0; i < 11; i++) {
        const nft = await MockNFTFactory.deploy(`NFT${i}`, `NFT${i}`, `https://example.com/nft${i}/`);
        nfts.push(await nft.getAddress());
      }

      await expect(vendor.batchAddWhitelistedCollections(nfts)).to.be.revertedWithCustomError(
        vendor,
        "ExceedsMaxWhitelistedCollections",
      );
    });

    it("Should allow owner to remove a collection", async function () {
      const mockNFTAddress = await mockNFT.getAddress();
      await vendor.removeWhitelistedCollection(mockNFTAddress);

      const collections = await vendor.getWhitelistedCollections();
      expect(collections).to.not.include(mockNFTAddress);
    });

    it("Should not allow removing a non-whitelisted collection", async function () {
      const MockNFTFactory = await ethers.getContractFactory("MockNFT");
      const nonListedNFT = await MockNFTFactory.deploy("NonListed", "NLNFT", "https://example.com/nl/");
      const nonListedNFTAddress = await nonListedNFT.getAddress();

      await expect(vendor.removeWhitelistedCollection(nonListedNFTAddress)).to.be.revertedWithCustomError(
        vendor,
        "CollectionAddressNotFound",
      );
    });
  });

  describe("🧪 Token Exchange Functionality", function () {
    it("Should not allow buying tokens without NFT", async function () {
      const [owner, user1] = await ethers.getSigners();

      // Approve tokens
      await dgToken.connect(user1).approve(vendorAddress, ethers.parseEther("10"));

      // Try to buy without NFT
      await expect(vendor.connect(user1).buyTokens(ethers.parseEther("10"))).to.be.revertedWithCustomError(
        vendor,
        "NoValidKeyForUserFound",
      );
    });

    it("Should allow buying tokens with NFT", async function () {
      const [owner, user1] = await ethers.getSigners();

      // Grant user1 a valid key
      await giveUserValidKey(user1.address);

      // Transfer some DGToken to user1
      await dgToken.transfer(user1.address, ethers.parseEther("100"));

      // User1 approves tokens
      await dgToken.connect(user1).approve(vendorAddress, ethers.parseEther("10"));

      // Get balances before
      const baseTokenBefore = await dgToken.balanceOf(user1.address);
      const swapTokenBefore = await yourToken.balanceOf(user1.address);

      // Buy tokens
      await vendor.connect(user1).buyTokens(ethers.parseEther("10"));

      // Get balances after
      const baseTokenAfter = await dgToken.balanceOf(user1.address);
      const swapTokenAfter = await yourToken.balanceOf(user1.address);

      // Expected swap tokens (taking into account 1% fee)
      const expectedSwapTokens = (ethers.parseEther("10") * BigInt(INITIAL_EXCHANGE_RATE) * 9900n) / 10000n; // Apply 1% fee

      // Check balances
      expect(baseTokenBefore - baseTokenAfter).to.equal(ethers.parseEther("10"));
      expect(swapTokenAfter - swapTokenBefore).to.equal(expectedSwapTokens);
    });

    it("Should not allow selling tokens without NFT", async function () {
      const [owner, user1] = await ethers.getSigners();

      // Transfer some YourToken to user1
      await yourToken.transfer(user1.address, ethers.parseEther("100"));

      // User1 approves tokens
      await yourToken.connect(user1).approve(vendorAddress, ethers.parseEther("50"));

      // Try to sell without NFT
      await expect(vendor.connect(user1).sellTokens(ethers.parseEther("50"))).to.be.revertedWithCustomError(
        vendor,
        "NoValidKeyForUserFound",
      );
    });

    it("Should allow selling tokens with NFT", async function () {
      const [owner, user1] = await ethers.getSigners();

      // Mint an NFT to user1
      await giveUserValidKey(user1.address);

      // Transfer some YourToken to user1
      await yourToken.transfer(user1.address, ethers.parseEther("100"));

      // User1 approves tokens
      await yourToken.connect(user1).approve(vendorAddress, ethers.parseEther("50"));

      // Get balances before
      const baseTokenBefore = await dgToken.balanceOf(user1.address);
      const swapTokenBefore = await yourToken.balanceOf(user1.address);

      // Sell tokens
      await vendor.connect(user1).sellTokens(ethers.parseEther("50"));

      // Get balances after
      const baseTokenAfter = await dgToken.balanceOf(user1.address);
      const swapTokenAfter = await yourToken.balanceOf(user1.address);

      // Expected base tokens (taking into account 2% fee)
      const expectedBaseTokens = (ethers.parseEther("50") * 9800n) / (BigInt(INITIAL_EXCHANGE_RATE) * 10000n); // Apply 2% fee

      // Check balances
      expect(swapTokenBefore - swapTokenAfter).to.equal(ethers.parseEther("50"));
      expect(baseTokenAfter - baseTokenBefore).to.approximately(expectedBaseTokens, 1000000); // Allow small rounding error
    });

    it("Should track fees correctly", async function () {
      const [owner, user1] = await ethers.getSigners();

      // Mint an NFT to user1
      await giveUserValidKey(user1.address);

      // Transfer tokens to user1
      await dgToken.transfer(user1.address, ethers.parseEther("100"));

      // User1 approves tokens
      await dgToken.connect(user1).approve(vendorAddress, ethers.parseEther("10"));

      // Buy tokens - generates swap token fees
      await vendor.connect(user1).buyTokens(ethers.parseEther("10"));

      // Calculate expected base token fee (not swap token fee)
      const baseTokenFee = (ethers.parseEther("10") * 100n) / 10000n; // 1% fee

      // Check base token fees
      const baseTokenFeesTracked = await vendor.baseTokenFees();
      expect(baseTokenFeesTracked).to.equal(baseTokenFee);

      // Get the exact balance of swap tokens
      const swapTokenBalance = await yourToken.balanceOf(user1.address);

      // User1 approves swap tokens - only the amount they actually have
      await yourToken.connect(user1).approve(vendorAddress, swapTokenBalance);

      // Sell tokens - generates swap token fees (using the actual balance)
      await vendor.connect(user1).sellTokens(swapTokenBalance);

      // Calculate expected swap token fee
      const swapTokenFee = (swapTokenBalance * 200n) / 10000n; // 2% fee

      // Check swap token fees
      const swapTokenFeesTracked = await vendor.swapTokenFees();
      expect(swapTokenFeesTracked).to.equal(swapTokenFee);
    });
  });

  describe("🧪 Fee Management", function () {
    it("Should allow owner to withdraw fees", async function () {
      const [owner, user1, feeReceiver] = await ethers.getSigners();

      // Mint an NFT to user1
      await giveUserValidKey(user1.address);

      // Transfer tokens to user1
      await dgToken.transfer(user1.address, ethers.parseEther("100"));
      await yourToken.transfer(user1.address, ethers.parseEther("100"));

      // User1 approves tokens
      await dgToken.connect(user1).approve(vendorAddress, ethers.parseEther("10"));
      await yourToken.connect(user1).approve(vendorAddress, ethers.parseEther("50"));

      // Generate some fees
      await vendor.connect(user1).buyTokens(ethers.parseEther("10"));

      // Get the actual balance of swap tokens from user1
      const swapTokenBalance = await yourToken.balanceOf(user1.address);
      await yourToken.connect(user1).approve(vendorAddress, swapTokenBalance);
      await vendor.connect(user1).sellTokens(swapTokenBalance);

      // Get fee balances
      const baseTokenFees = await vendor.baseTokenFees();
      const swapTokenFees = await vendor.swapTokenFees();

      // Get balances before withdrawal
      const baseTokenBefore = await dgToken.balanceOf(devAddress);
      const swapTokenBefore = await yourToken.balanceOf(devAddress);

      // Withdraw fees as the owner
      await vendor.connect(owner).withdrawFees();

      // Get balances after withdrawal
      const baseTokenAfter = await dgToken.balanceOf(devAddress);
      const swapTokenAfter = await yourToken.balanceOf(devAddress);

      // Check balances
      expect(baseTokenAfter - baseTokenBefore).to.equal(baseTokenFees);
      expect(swapTokenAfter - swapTokenBefore).to.equal(swapTokenFees);

      // Check fees are reset
      expect(await vendor.baseTokenFees()).to.equal(0);
      expect(await vendor.swapTokenFees()).to.equal(0);
    });

    it("Should not allow non-owner to withdraw fees", async function () {
      const [owner, user1] = await ethers.getSigners();

      await expect(vendor.connect(user1).withdrawFees()).to.be.revertedWithCustomError(vendor, "UnauthorizedCaller");
    });
  });

  describe("🧪 ETH Management", function () {
    it("Should allow contract to receive ETH", async function () {
      const [owner] = await ethers.getSigners();
      const ethAmount = ethers.parseEther("1.0");

      // Send ETH to contract
      await owner.sendTransaction({
        to: vendorAddress,
        value: ethAmount,
      });

      // Check contract ETH balance
      const balance = await ethers.provider.getBalance(vendorAddress);
      expect(balance).to.equal(ethAmount);
    });

    it("Should allow owner to withdraw ETH", async function () {
      const [owner, user1] = await ethers.getSigners();
      const ethAmount = ethers.parseEther("1.0");

      // Send ETH to contract
      await owner.sendTransaction({
        to: vendorAddress,
        value: ethAmount,
      });

      // Get balance before withdrawal
      const balanceBefore = await ethers.provider.getBalance(devAddress);

      // Withdraw ETH as the owner
      await vendor.connect(owner).withdrawETH();

      // Get balance after withdrawal
      const balanceAfter = await ethers.provider.getBalance(devAddress);

      // Check dev address balance increased
      expect(balanceAfter - balanceBefore).to.equal(ethAmount);

      // Check contract balance
      const contractBalance = await ethers.provider.getBalance(vendorAddress);
      expect(contractBalance).to.equal(0);
    });

    it("Should not allow non-owner to withdraw ETH", async function () {
      const [owner, user1] = await ethers.getSigners();

      await expect(vendor.connect(user1).withdrawETH()).to.be.revertedWithCustomError(vendor, "UnauthorizedCaller");
    });
  });

  describe("🧪 Exchange Rate Management", function () {
    it("Should allow owner to set exchange rate after cooldown", async function () {
      // Fast forward 90 days
      await time.increase(DAYS_90);

      const newRate = 10;
      await vendor.setExchangeRate(newRate);

      expect(await vendor.exchangeRate()).to.equal(newRate);
    });

    it("Should not allow setting exchange rate before cooldown", async function () {
      await expect(vendor.setExchangeRate(10)).to.be.revertedWithCustomError(vendor, "RateLockStillActive");
    });

    it("Should correctly report if exchange rate can be changed", async function () {
      // Initially should be false
      expect(await vendor.canChangeExchangeRate()).to.be.false;

      // Fast forward 90 days
      await time.increase(DAYS_90);

      // Now should be true
      expect(await vendor.canChangeExchangeRate()).to.be.true;
    });
  });

  describe("🧪 Fee Rate Management", function () {
    it("Should allow owner to set fee rates after cooldown", async function () {
      // Fast forward 100 days instead of 90
      await time.increase(DAYS_100);

      const newBuyFeeBPS = 150; // 1.5%
      const newSellFeeBPS = 250; // 2.5%
      await vendor.setFeeRates(newBuyFeeBPS, newSellFeeBPS);

      expect(await vendor.buyFeeBPS()).to.equal(newBuyFeeBPS);
      expect(await vendor.sellFeeBPS()).to.equal(newSellFeeBPS);
    });

    it("Should not allow setting fee rates before cooldown", async function () {
      await expect(vendor.setFeeRates(150, 250)).to.be.revertedWithCustomError(vendor, "FeeLockStillActive");
    });

    it("Should not allow setting fee rates above maximum", async function () {
      // Fast forward 100 days instead of 90
      await time.increase(DAYS_100);

      const maxFeeBPS = await vendor.MAX_FEE_BPS();
      const tooHighFee = maxFeeBPS + 1n;

      await expect(vendor.setFeeRates(tooHighFee, 250)).to.be.revertedWithCustomError(vendor, "InvalidFeeBPS");

      await expect(vendor.setFeeRates(150, tooHighFee)).to.be.revertedWithCustomError(vendor, "InvalidFeeBPS");
    });

    it("Should correctly report if fee rates can be changed", async function () {
      // Initially should be false
      expect(await vendor.canChangeFeeRates()).to.be.false;

      // Fast forward 100 days
      await time.increase(DAYS_100);

      // Now should be true
      expect(await vendor.canChangeFeeRates()).to.be.true;
    });
  });

  describe("🧪 NFT Validation", function () {
    it("Should correctly detect user with an NFT", async function () {
      const [owner, user1] = await ethers.getSigners();

      // Initially user has no NFT
      expect(await vendor.hasValidKey(user1.address)).to.be.false;

      // Mint an NFT to user1
      await giveUserValidKey(user1.address);

      // Now user should have an NFT
      expect(await vendor.hasValidKey(user1.address)).to.be.true;
    });

    it("Should correctly identify valid collection for user", async function () {
      const [owner, user1] = await ethers.getSigners();
      const mockNFTAddress = await mockNFT.getAddress();

      // Initially user has no NFT
      expect(await vendor.getFirstValidKeyCollection(user1.address)).to.equal(ethers.ZeroAddress);

      // Mint an NFT to user1
      await giveUserValidKey(user1.address);

      // Now user should have mockNFT as valid collection
      expect(await vendor.getFirstValidKeyCollection(user1.address)).to.equal(mockNFTAddress);
    });

    it("Should handle empty whitelist correctly", async function () {
      const [owner, user1] = await ethers.getSigners();
      const mockNFTAddress = await mockNFT.getAddress();

      // Remove all collections
      await vendor.removeWhitelistedCollection(mockNFTAddress);

      // Mint an NFT to user1
      await giveUserValidKey(user1.address);

      // User should not have valid key (empty whitelist)
      expect(await vendor.hasValidKey(user1.address)).to.be.false;
    });
  });

  describe("🧪 Integration Tests", function () {
    it("Should handle full buy/sell cycle", async function () {
      const [owner, user1] = await ethers.getSigners();

      // Mint an NFT to user1
      await giveUserValidKey(user1.address);

      // Transfer some DGToken to user1
      await dgToken.transfer(user1.address, ethers.parseEther("100"));

      // User1 approves tokens
      await dgToken.connect(user1).approve(vendorAddress, ethers.parseEther("20"));

      // Buy tokens
      await vendor.connect(user1).buyTokens(ethers.parseEther("20"));

      // Get swap token balance
      const swapTokenBalance = await yourToken.balanceOf(user1.address);

      // User1 approves swap tokens
      await yourToken.connect(user1).approve(vendorAddress, swapTokenBalance);

      // Get base token balance before selling
      const baseTokenBefore = await dgToken.balanceOf(user1.address);

      // Sell all swap tokens
      await vendor.connect(user1).sellTokens(swapTokenBalance);

      // Get base token balance after selling
      const baseTokenAfter = await dgToken.balanceOf(user1.address);

      // Due to fees, user should have less tokens than started with
      expect(baseTokenAfter).to.be.lessThan(ethers.parseEther("100"));
      expect(baseTokenAfter).to.be.greaterThan(ethers.parseEther("90")); // Should lose less than 10%
    });

    it("Should handle exchange rate changes", async function () {
      const [owner, user1] = await ethers.getSigners();

      // Mint an NFT to user1
      await giveUserValidKey(user1.address);

      // Fast forward 90 days
      await time.increase(DAYS_90);

      // Change rate to 10 (was 5)
      await vendor.setExchangeRate(10);

      // Transfer some DGToken to user1
      await dgToken.transfer(user1.address, ethers.parseEther("10"));

      // User1 approves tokens
      await dgToken.connect(user1).approve(vendorAddress, ethers.parseEther("10"));

      // Buy tokens
      await vendor.connect(user1).buyTokens(ethers.parseEther("10"));

      // User should get ~99 tokens (10 * 10 - 1% fee)
      const swapTokenBalance = await yourToken.balanceOf(user1.address);
      expect(swapTokenBalance).to.be.approximately(
        ethers.parseEther("99"),
        ethers.parseEther("0.1"), // Allow small rounding error
      );
    });

    it("Should handle fee rate changes", async function () {
      const [owner, user1] = await ethers.getSigners();

      // Mint an NFT to user1
      await giveUserValidKey(user1.address);

      // Fast forward 100 days instead of 90
      await time.increase(DAYS_100);

      // Change fee rates (buy: 1% -> 2%, sell: 2% -> 3%)
      await vendor.setFeeRates(200, 300);

      // Transfer some DGToken to user1
      await dgToken.transfer(user1.address, ethers.parseEther("10"));

      // User1 approves tokens
      await dgToken.connect(user1).approve(vendorAddress, ethers.parseEther("10"));

      // Buy tokens
      await vendor.connect(user1).buyTokens(ethers.parseEther("10"));

      // User should get ~49 tokens (10 * 5 - 2% fee)
      const swapTokenBalance = await yourToken.balanceOf(user1.address);
      expect(swapTokenBalance).to.be.approximately(
        ethers.parseEther("49"),
        ethers.parseEther("0.1"), // Allow small rounding error
      );

      // User1 approves swap tokens
      await yourToken.connect(user1).approve(vendorAddress, swapTokenBalance);

      // Get base token balance before selling
      const baseTokenBefore = await dgToken.balanceOf(user1.address);

      // Sell all swap tokens
      await vendor.connect(user1).sellTokens(swapTokenBalance);

      // Get base token balance after selling
      const baseTokenAfter = await dgToken.balanceOf(user1.address);

      // Due to increased fees, user should get back less than 10 tokens (around 9.5)
      const baseTokenDiff = baseTokenAfter - baseTokenBefore;
      expect(baseTokenDiff).to.be.lessThan(ethers.parseEther("9.6"));
      expect(baseTokenDiff).to.be.greaterThan(ethers.parseEther("9.4"));
    });
  });
});
