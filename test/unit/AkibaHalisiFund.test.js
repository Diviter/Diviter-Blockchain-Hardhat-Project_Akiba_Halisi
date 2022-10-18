const { assert, expect } = require("chai");
const {
  network,
  deployment,
  ethers,
  getNamedAccounts,
  deployments,
} = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config.js");

let akibaHalisi;
let mockV3Aggregator;
let deployer;

const sendValue = ethers.utils.parseEther("1");
beforeEach(async () => {
  deployer = (await getNamedAccounts()).deployer;
  await deployments.fixture(["all"]);
  akibaHalisi = await ethers.getContract("AkibaFunds", deployer);
  mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
});

describe("constructor", function () {
  it("it sets the aggregator address correctly", async () => {
    const response = await akibaHalisi.s_priceFeed();
    assert.equal(response, mockV3Aggregator.address);
  });
});

describe("Deposit", function () {
  it("it fails if you dont send enough ETH", async () => {
    await expect(akibaHalisi.Deposit()).to.be.revertedWith(
      "Insuffient funds. You need to spend more ETH"
    );
  });

  it("it also updates the amount funded data structure", async () => {
    await akibaHalisi.Deposit({ value: sendValue });
    const response = await akibaHalisi.addressToPremiumDeposited(deployer);
    assert.equal(response.toString(), sendValue.toString());
  });

  it("adds insured to an array of insureds", async () => {
    await akibaHalisi.Deposit({ value: sendValue });
    const response = await akibaHalisi.getInsureds(0);
    assert.equal(response, deployer);
  });
});

describe("withdraw", function () {
  beforeEach(async () => {
    await akibaHalisi.Deposit({ value: sendValue });
  });

  it("it withdraws ETH from a single Insured", async () => {
    //arrange
    const startingAkibaFundsBalance = await akibaHalisi.provider.getBalance(
      akibaHalisi.address
    );
    const startingDeployerBalance = await akibaHalisi.provider.getBalance(
      deployer
    );

    //act
    const transactionResponse = await akibaHalisi.Withdraw();
    const transactionReceipt = await transactionResponse.wait();

    const { gasUsed, effectiveGasPrice } = transactionReceipt;
    const gasCost = gasUsed.mul(effectiveGAsPrice);

    const endingAkibaFundsBalance = await akibaHalisi.provider.getBalance(
      akibaHalisi.address
    );
    const endingDeployerBalance = await akibaHalisi.provider.getBalance(
      deployer
    );

    //assert
    assert.equal(endingAkibaFundsBalance, 0);
    assert.equal(
      startingAkibaFundsBalance.add(startingDeployerBalance).toString(),
      endingDeployerBalance.add(gasCost).toString()
    );
  });

  it("allows us to withdraw with multiple insureds", async () => {
    //arrange
    const accounts = await ethers.getSigners();
    for (i = 1; i < 10; i++) {
      const akibaFundsConnectedContract = await akibaHalisi.connect(
        accounts[i]
      );
      await akibaFundsConnectedContract.Deposit({ value: sendValue });
    }
    const startingAkibaFundsBalance = await akibaHalisi.provider.getBalance(
      akibaHalisi.address
    );
    const startingDeployerBalance = await akibaHalisi.provider.getBalance(
      deployer
    );

    //act
    const transactionResponse = await akibaHalisi.Withdraw();

    const transactionReceipt = await transactionResponse.wait();
    const { gasUsed, effectiveGAsPrice } = transactionReceipt;
    const withdrawGasCost = gasUsed.mul(effectiveGAsPrice);
    console.log(`GasCost: ${withdrawGasCost}`);
    console.log(`GasUsed: ${gasUsed}`);
    console.log(`GasPrice: ${effectiveGasPrice}`);

    const endingAkibaFundsBalance = await akibaHalisi.provider.getBalance(
      akibaHalisi.address
    );
    const endingDeployerBalance = await akibaHalisi.provider.getBalance(
      deployer
    );

    //assert
    assert.equal(
      startingAkibaFundsBalance.add(startingDeployerBalance).toString(),
      endingDeployerBalance.add(withdrawGasCost).toString()
    );
  });

  it("only allows the owner to withdraw", async function () {
    const accounts = await ethers.getSigners();
    const akibaFundsConnectedContract = await akibaHalisi.connect(accounts[1]);
    await expect(akibaFundsConnectedContract.Withdraw()).to.be.revertedWith(
      "AkibaHalisi__NotOwner"
    );
  });
});
