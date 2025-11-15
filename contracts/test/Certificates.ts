import { expect } from "chai";
import { network } from "hardhat";
import {EventLog} from "ethers";

describe("Certificates", function () {
    let ethers: Awaited<ReturnType<typeof network.connect>>["ethers"];

    before(async function () {
        const hre = await network.connect();
        ethers = hre.ethers;
    });

  it("Should emit the Increment event when calling the inc() function", async function () {
    const counter = await ethers.deployContract("Counter");

    await expect(counter.inc()).to.emit(counter, "Increment").withArgs(1n);
  });

  it("The sum of the Increment events should match the current value", async function () {
    const counter = await ethers.deployContract("Counter");
    const deploymentBlockNumber = await ethers.provider.getBlockNumber();

    for (let i = 1; i <= 10; i++) {
      await counter.incBy(i);
    }

    const events = await counter.queryFilter(
      counter.filters.Increment(),
      deploymentBlockNumber,
      "latest",
    );

      let total = 0n;
      for (const event of events) {
          if (event instanceof EventLog) {
              total += event.args.by;
          }
      }

    expect(await counter.x()).to.equal(total);
  });
});
