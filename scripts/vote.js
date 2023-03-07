const fs = require("fs");
const { network, ethers } = require("hardhat");
const {
  proposalsFile,
  developmentChains,
  VOTING_PERIOD,
} = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-blocks");

const index = 0;

async function main(proposalIndex) {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf-8"));
  const proposalId = proposals[network.config.chainId][proposalIndex];
  // 0 = Against, 1 = For, 2 = Abstain
  const voteWay = 1;
  const reason = "I loke a do cha cha";
  await vote(proposalId, voteWay, reason);
}

async function vote(proposalId, voteWay, reason) {
  console.log("Voting...");
  const governor = await ethers.getContract("GovernorContract");
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
  const voteTxReceipt = await voteTx.wait(1);
  console.log(voteTxReceipt.events[0].args.reason);
  const proposalState = await governor.state(proposalId);
  console.log(`Current Proposal State: ${proposalState}`);

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }
  console.log("Voted! Ready to go!");
}

main(index)
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });