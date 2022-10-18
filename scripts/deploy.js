// imports
const { ethers, run, network } = require("hardhat");

// async main
async function main() {
  const AkibaHalisiFactory = await ethers.getContractFactory("AkibaHalisi");
  console.log("Deploying contract...");
  const akibaHalisi = await AkibaHalisiFactory.deploy();
  await akibaHalisi.deployed();
  console.log(`Deployed contract to: ${akibaHalisi.address}`);

  // what happens when we deploy to our hardhat network?
  if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await akibaHalisi.deployTransaction.wait(6);
    await verify(akibaHalisi.address, []);
  }

  const currentValue = await akibaHalisi.retrieve();
  console.log(`Current Value is: ${currentValue}`);

  // Update the current value
  const transactionResponse = await akibaHalisi.store(7);
  await transactionResponse.wait(1);
  const updatedValue = await akibaHalisi.retrieve();
  console.log(`Updated Value is: ${updatedValue}`);
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
};

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
