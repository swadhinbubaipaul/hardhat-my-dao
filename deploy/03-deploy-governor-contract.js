const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  VOTING_DELAY,
  VOTING_PERIOD,
  QUORUM_PERCENTAGE,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const governanceToken = await get("GovernanceToken");
  const timeLock = await get("TimeLock");
  const arguments = [
    governanceToken.address,
    timeLock.address,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
  ];
  log("Deploying Governor contract...");
  const governorContract = await deploy("GovernorContract", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: !developmentChains.includes(network.name)
      ? VERIFICATION_BLOCK_CONFIRMATIONS
      : 1,
  });

  log(`Deployed Governor contract at ${governorContract.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(governorContract.address, arguments);
  }
};
