const { ethers, network } = require("hardhat");
const fs = require("fs");
const {
  developmentChains,
  NEW_STORE_VALUE,
  FUNC,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  proposalsFile,
} = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-blocks");

async function propose(functionToCall, args, proposalDescription) {
  const governor = await ethers.getContract("GovernorContract");
  const box = await ethers.getContract("Box");
  const encodedFunctionCall = box.interface.encodeFunctionData(
    functionToCall,
    args
  );
  console.log(
    `Proposing ${functionToCall} on ${box.address} with args ${args}`
  );
  console.log(`Proposal description: \n${proposalDescription}`);
  const proposeTx = await governor.propose(
    [box.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );
  const proposeReceipt = await proposeTx.wait(1);

  // Moving Blocks for local DevChain
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }

  const proposalId = proposeReceipt.events[0].args.proposalId;
  console.log(`Proposed with proposal ID:\n  ${proposalId}`);

  const proposalState = await governor.state(proposalId);
  const proposalSnapShot = await governor.proposalSnapshot(proposalId);
  const proposalDeadline = await governor.proposalDeadline(proposalId);
  // Save the proposalId
  let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  if (proposals[network.config.chainId] == undefined) {
    proposals[network.config.chainId.toString()] = [];
  }
  proposals[network.config.chainId.toString()].push(proposalId.toString());
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals));

  // The state of the proposal. 1 is not passed. 0 is passed.
  console.log(`Current Proposal State: ${proposalState}`);
  // What block # the proposal was snapshot
  console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
  // The block number the proposal voting expires
  console.log(`Current Proposal Deadline: ${proposalDeadline}`);
}

propose(FUNC, [NEW_STORE_VALUE], PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
