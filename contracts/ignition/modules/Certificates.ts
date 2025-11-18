import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CertificatesModule", (m) => {
  const certificates = m.contract("Certificates");
  return { certificates };
});
