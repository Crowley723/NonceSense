import {
  generateSerialNumber,
  getCertificatesContractWithSigner,
  getSigner,
  hashCertificate,
  IPFSUpload,
} from "@/lib/contracts-utils.ts";
import { JsonRpcProvider } from "ethers";

// generateTestCertificates adds a number of (fake) certificates for the purpose of testing the display and revocation. They are not full x509 certs, but they work on the chain.
export async function generateTestCertificates(count: number) {
  const provider = new JsonRpcProvider("http://127.0.0.1:8545");
  const availableAddresses: string[] = [];

  for (let i = 0; i < 10; i++) {
    try {
      const signer = await provider.getSigner(i);
      const address = await signer.getAddress();
      availableAddresses.push(address);
    } catch {
      break;
    }
  }

  if (availableAddresses.length === 0) {
    throw new Error("No addresses available");
  }

  console.log(
    `Generating ${count} test certificates for random existing addresses...`,
  );
  console.log(`Available addresses: ${availableAddresses.length}`);

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableAddresses.length);
    const randomAddress = availableAddresses[randomIndex];

    const signer = await provider.getSigner(randomIndex);
    const contract = await getCertificatesContractWithSigner(signer);

    const fileName = `test-cert-${i + 1}.pdf`;
    const fileContent = `This is test certificate number ${i + 1}\nIssued to: ${randomAddress}\nDate: ${new Date().toISOString()}`;

    const serialNumber = generateSerialNumber(fileName);
    const ipfsCID = IPFSUpload(fileContent);
    const certHash = hashCertificate(fileContent);

    const tx = await contract.registerCertificate(
      serialNumber,
      ipfsCID,
      certHash,
    );
    await tx.wait();

    console.log(
      `Registered certificate ${i + 1}/${count}: ${serialNumber} for ${randomAddress}`,
    );
  }

  console.log("All certificates generated!");

  return availableAddresses;
}

export async function revokeRandomCertificates(count: number) {
  const contract = await getCertificatesContractWithSigner();
  const signer = await getSigner();
  const signerAddress = await signer.getAddress();

  const serialNumbers = await contract.getOwnerCertificates(signerAddress);

  if (serialNumbers.length === 0) {
    console.log("No certificates to revoke");
    return;
  }

  const toRevoke = Math.min(count, serialNumbers.length / 2);
  const shuffled = [...serialNumbers].sort(() => Math.random() - 0.5);

  console.log(`Revoking ${toRevoke} random certificates...`);

  const results = {
    successful: 0,
    failed: 0,
    errors: [] as Array<{ serialNumber: string; error: string }>,
  };

  for (let i = 0; i < toRevoke; i++) {
    const serialNumber = shuffled[i];

    try {
      const tx = await contract.revokeCertificate(serialNumber);
      await tx.wait();
      results.successful++;
      console.log(`Revoked certificate ${i + 1}/${toRevoke}: ${serialNumber}`);
    } catch (error) {
      results.failed++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      results.errors.push({
        serialNumber: serialNumber.toString(),
        error: errorMessage,
      });
      console.error(
        `Failed to revoke certificate ${serialNumber}:`,
        errorMessage,
      );
    }
  }

  console.log("Revocations complete!");
}
