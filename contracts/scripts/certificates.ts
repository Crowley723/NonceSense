import hre from "hardhat";
const { ethers } = hre as any;

async function main() {
  console.log("Deploying Certificates contract...");
  
  const Certificates = await ethers.getContractFactory("Certificates");
  const certificate = await Certificates.deploy();
  await certificate.waitForDeployment();
  
  const address = await certificate.getAddress();
  console.log("Counter deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
