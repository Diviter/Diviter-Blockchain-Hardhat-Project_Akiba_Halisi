const networkConfig = {
  4: {
    name: "Rinkeby",
    ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
  },

  5: {
    name: "Goerli",
    ethUsdPriceFeed: "	0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },

  42: {
    name: "Kovan",
    ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
