import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import hardhatEthersPlugin from "@nomicfoundation/hardhat-ethers";
import hardhatAbiExporter from "@solidstate/hardhat-abi-exporter";

const config: HardhatUserConfig = {
  plugins: [
    hardhatToolboxMochaEthersPlugin,
      hardhatEthersPlugin,
    hardhatAbiExporter,
  ],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
    },
  },
  abiExporter: {
    path: '../web/src/contracts',
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
  },
};

export default config;
