import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import CounterABI from "../../contracts/Counter.json";
import deployedAddresses from "../../contracts/deployed_addresses.json";

export const Route = createFileRoute("/user/counter")({
  component: Counter,
});

const CONTRACT_ADDRESS = deployedAddresses["CounterModule#Counter"];

function Counter() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [counterValue, setCounterValue] = useState<string>("0");
  const [account, setAccount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const connect = async () => {
    try {
      setLoading(true);
      const provider = new JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(0);
      const address = await signer.getAddress();
      setAccount(address);

      const contractInstance = new Contract(
        CONTRACT_ADDRESS,
        CounterABI,
        signer,
      );
      setContract(contractInstance);

      const value = await contractInstance.x();
      setCounterValue(value.toString());
    } catch (error) {
      console.error("Error connecting:", error);
      alert("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const readCounter = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const value = await contract.x();
      setCounterValue(value.toString());
    } catch (error) {
      console.error("Error reading counter:", error);
      alert("Failed to read counter value");
    } finally {
      setLoading(false);
    }
  };

  const increment = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.inc();
      await tx.wait();
      await readCounter();
    } catch (error) {
      console.error("Error incrementing:", error);
      alert("Failed to increment counter");
    } finally {
      setLoading(false);
    }
  };

  const incrementBy = async () => {
    if (!contract) return;

    const amount = prompt("Enter amount to increment by:");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid positive number");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.incBy(Number(amount));
      await tx.wait();
      await readCounter();
    } catch (error) {
      console.error("Error incrementing by amount:", error);
      alert("Failed to increment counter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center content-center bg-background overflow-hidden">
      <div className="w-full max-w-md px-4 text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-foreground mb-2">
            Counter DApp
          </h1>
          <p className="text-muted-foreground">Blockchain-based counter</p>
        </div>

        {!account ? (
          <button
            onClick={connect}
            disabled={loading}
            className="w-full px-8 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-semibold rounded-lg transition-colors"
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2">Account</p>
              <p className="font-mono text-sm break-all text-foreground">
                {account}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground mb-2">Counter Value</p>
              <p className="text-6xl font-bold text-primary">{counterValue}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={readCounter}
                disabled={loading}
                className="w-full px-6 py-2 bg-background-low hover:bg-background-medium disabled:bg-muted text-foreground font-semibold rounded-lg transition-colors border border-border"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={increment}
                disabled={loading}
                className="w-full px-6 py-2 bg-accent hover:bg-accent/90 disabled:bg-muted text-accent-foreground font-semibold rounded-lg transition-colors"
              >
                {loading ? "Processing..." : "Increment by 1"}
              </button>
              <button
                onClick={incrementBy}
                disabled={loading}
                className="w-full px-6 py-2 bg-accent hover:bg-accent/90 disabled:bg-muted text-accent-foreground font-semibold rounded-lg transition-colors"
              >
                {loading ? "Processing..." : "Increment by Amount"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Counter;
