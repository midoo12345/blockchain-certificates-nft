require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
      // This ensures the local network is always available
      mining: {
        auto: true,
        interval: 0
      }
    }
  },
  // This makes the local network available for testing
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
  }
};
