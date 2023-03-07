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
  log("Deploying Box...");
  const arguments = [];
  const box = await deploy("Box", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: !developmentChains.includes(network.name)
      ? VERIFICATION_BLOCK_CONFIRMATIONS
      : 1,
  });

  log(`Deployed Box at ${box.address}`);

  const timeLock = await ethers.getContract("TimeLock");
  const boxContract = await ethers.getContract("Box");
  const transferOwnerTx = await boxContract.transferOwnership(timeLock.address);
  await transferOwnerTx.wait(1);
  log("Set ownership to Timelock contract!");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(box.address, arguments);
  }
};
