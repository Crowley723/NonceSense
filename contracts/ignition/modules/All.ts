import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import CounterModule from "./Counter";
import CertificatesModule from "./Certificates";

export default buildModule("AllContracts", (m) => {
    const { counter } = m.useModule(CounterModule);
    const { certificates } = m.useModule(CertificatesModule);

    return { counter, certificates };
});