const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
const {
	developmentChains,
	VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	log("Deploying governance token...");
	const governanceToken = await deploy("GovernanceToken", {
		from: deployer,
		args: [],
		log: true,
		waitConfirmations: !developmentChains.includes(network.name)
			? VERIFICATION_BLOCK_CONFIRMATIONS
			: 1,
	});

	log(`Deployed GovernanceToken at ${governanceToken.address}`);
	await delegate(governanceToken.address, deployer);
	log("Delegated!");

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(governanceToken.address, []);
	}
};

const delegate = async (governanceTokenAddress, delegatedAccount) => {
	const governanceToken = await ethers.getContractAt(
		"GovernanceToken",
		governanceTokenAddress
	);
	const tx = await governanceToken.delegate(delegatedAccount);
	await tx.wait(1);
};
