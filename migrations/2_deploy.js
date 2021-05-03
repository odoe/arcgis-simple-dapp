const Token = artifacts.require("GeoAsset");

module.exports = async function(deployer) {
	//deploy Token
	await deployer.deploy(Token);

	//assign token into variable to get it's address
	const token = await Token.deployed();
};