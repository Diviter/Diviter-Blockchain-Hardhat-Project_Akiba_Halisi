const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat.config.js");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  log("----------------------------------------------------------------------");

  log(" Deploying AkibaHalisiFund and waiting for confirmations...");

  const akibaFunds = await deploy("AkibaFunds", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,

    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`AkibaFunds deployed at ${akibaFunds.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(akibaFunds.address, [ethUsdPriceFeedAddress]);
  }
};

module.exports.tags = ["all", "akibaFunds"];
