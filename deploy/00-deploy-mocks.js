const { network } = require("hardhat");

const DECIMALS = "8";
const INITIAL_PRICE = "5000000000"; //USD 50
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    log("Local network detected! Deploying Mocks...");

    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("mocks deployed");
    log("-------------------------------------------------------------------");
    log(
      "You are deploying to a local network. You will need a local network running to interact with"
    );
    log(
      "Please run `npx hardhat console` to interact with the deployed smart contract!"
    );
    log("--------------------------------------------------------------------");
  }
};
module.exports.tags = ["all", "mocks"];
