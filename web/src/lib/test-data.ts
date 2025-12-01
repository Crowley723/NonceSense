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
    `Generating ${count + 2} test certificates (including secure.com and insecure.com)...`,
  );
  console.log(`Available addresses: ${availableAddresses.length}`);

  // Always create secure.com certificate first
  console.log("Creating secure.com certificate...");
  const secureSigner = await provider.getSigner(0);
  const secureContract = await getCertificatesContractWithSigner(secureSigner);
  const secureAddress = await secureSigner.getAddress();

  const secureFileName = "secure-cert.pdf";
  const secureFileContent = `This is a secure certificate for secure.com\nIssued to: ${secureAddress}\nDate: ${new Date().toISOString()}`;
  const secureSerialNumber = generateSerialNumber(secureFileName);
  const secureIpfsCID = await IPFSUpload(secureFileContent);
  const secureCertHash = hashCertificate(secureFileContent);

  const secureTx = await secureContract.registerCertificate(
    "secure.com",
    secureSerialNumber,
    secureIpfsCID,
    secureCertHash,
  );
  await secureTx.wait();
  console.log(`Registered secure.com certificate: ${secureSerialNumber}`);

  // Create insecure.com certificate and immediately revoke it
  console.log("Creating insecure.com certificate (will be revoked)...");
  const insecureSigner = await provider.getSigner(1);
  const insecureContract =
    await getCertificatesContractWithSigner(insecureSigner);
  const insecureAddress = await insecureSigner.getAddress();

  const insecureFileName = "insecure-cert.pdf";
  const insecureFileContent = `This is a certificate for insecure.com (to be revoked)\nIssued to: ${insecureAddress}\nDate: ${new Date().toISOString()}`;
  const insecureSerialNumber = generateSerialNumber(insecureFileName);
  const insecureIpfsCID = await IPFSUpload(insecureFileContent);
  const insecureCertHash = hashCertificate(insecureFileContent);

  const insecureTx = await insecureContract.registerCertificate(
    "insecure.com",
    insecureSerialNumber,
    insecureIpfsCID,
    insecureCertHash,
  );
  await insecureTx.wait();
  console.log(`Registered insecure.com certificate: ${insecureSerialNumber}`);

  // Revoke the insecure.com certificate
  const revokeTx =
    await insecureContract.revokeCertificate(insecureSerialNumber);
  await revokeTx.wait();
  console.log(`Revoked insecure.com certificate: ${insecureSerialNumber}`);

  console.log(`Generating ${count} additional random certificates...`);
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableAddresses.length);
    const randomAddress = availableAddresses[randomIndex];

    const signer = await provider.getSigner(randomIndex);
    const contract = await getCertificatesContractWithSigner(signer);

    const fileName = `test-cert-${i + 1}.pdf`;
    const fileContent = `This is test certificate number ${i + 1}\nIssued to: ${randomAddress}\nDate: ${new Date().toISOString()}`;

    const serialNumber = generateSerialNumber(fileName);
    const ipfsCID = await IPFSUpload(fileContent);
    const certHash = hashCertificate(fileContent);

    const domain = `example${i + 1}.com`;
    const tx = await contract.registerCertificate(
      domain,
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

  const toRevoke = Math.min(count, serialNumbers.length);
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
