import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "hardhatOp",
  chainType: "op",
});

async function main() {
  console.log("Deploying Counter contract...");
  
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  
  const address = await counter.getAddress();
  console.log("Counter deployed to:", address);
  
  console.log("Initial count:", (await counter.x()).toString());
  await counter.inc();
  console.log("After inc:", (await counter.x()).toString());

  await counter.incBy(5);
  console.log("After incBy:", (await counter.x()).toString());
}

main().catch(console.error);
