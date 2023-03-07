const { ethers, network } = require("hardhat");

async function main() {
	const accounts = await ethers.getSigners();

	const governanceToken = await ethers.getContract("GovernanceToken");
	await governanceToken.requestMembership();
	console.log("Membership requested");
	await governanceToken.approveMembership(0);
	console.log("Membership Approved");
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
