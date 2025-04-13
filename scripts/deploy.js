const hre = require("hardhat");

async function main() {
  console.log("Deploying CertificateNFT contract to local network...");
  
  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();
  
  await certificateNFT.waitForDeployment();
  
  const address = await certificateNFT.getAddress();
  console.log("CertificateNFT deployed to:", address);
  console.log("You can now use this address in your frontend App.js");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 