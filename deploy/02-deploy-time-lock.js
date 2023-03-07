const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  MIN_DELAY,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("Deploying Timelock...");
  const arguments = [MIN_DELAY, [], [], deployer];
  const timeLock = await deploy("TimeLock", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: !developmentChains.includes(network.name)
      ? VERIFICATION_BLOCK_CONFIRMATIONS
      : 1,
  });

  log(`Deployed Timelock at ${timeLock.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(timeLock.address, arguments);
  }
};
