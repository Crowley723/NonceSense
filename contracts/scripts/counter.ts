import hre from "hardhat";
const { ethers } = hre as any;
//this is scuffed because of weird import issues related to hre.ethers


async function main() {
    console.log("Deploying Counter contract...");

    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();
    await counter.waitForDeployment();

    const address = await counter.getAddress();
    console.log("Counter deployed to:", address);

    console.log("Initial count:", await counter.getCount());
    await counter.increment();
    console.log("After increment:", await counter.getCount());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });