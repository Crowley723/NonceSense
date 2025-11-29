import {
  Contract,
  JsonRpcProvider,
  JsonRpcSigner,
  keccak256,
  toUtf8Bytes,
} from "ethers";
import CertificatesABI from "../contracts/Certificates.json";
import deployedAddresses from "../contracts/deployed_addresses.json";

export const CERTIFICATES_ADDRESS =
  deployedAddresses["CertificatesModule#Certificates"];

export interface Certificate {
  serialNumber: string;
  ipfsCID: string;
  certificateHash: string;
  owner: string;
  timestamp: bigint;
  revoked: boolean;
}

// Get provider for read-only operations
export function getProvider() {
  return new JsonRpcProvider("http://127.0.0.1:8545");
}

// Get signer for write operations (uses local Hardhat account)
export async function getSigner() {
  const provider = getProvider();
  // Use the first account from Hardhat local node
  return await provider.getSigner(0);
}

// Get contract instance for reading
export function getCertificatesContract() {
  const provider = getProvider();
  return new Contract(CERTIFICATES_ADDRESS, CertificatesABI, provider);
}

// Get contract instance for writing
export async function getCertificatesContractWithSigner(
  signer?: JsonRpcSigner,
) {
  if (!signer) {
    signer = await getSigner();
  }
  return new Contract(CERTIFICATES_ADDRESS, CertificatesABI, signer);
}

// Hash certificate file content
export function hashCertificate(content: string): string {
  return keccak256(toUtf8Bytes(content));
}

// Generate serial number from file
export function generateSerialNumber(fileName: string): string {
  return `CERT-${Date.now()}-${fileName.replace(/[^a-zA-Z0-9]/g, "")}`;
}

// Mock IPFS upload - generates fake CID and stores locally
export function mockIPFSUpload(fileContent: string, fileName: string): string {
  // Generate a fake IPFS CID (looks like: Qm...)
  const contentHash = hashCertificate(fileContent).slice(2, 48); // Take part of hash
  const fakeCID = `Qm${contentHash}`;

  // Store file content locally in browser storage
  const storageKey = `ipfs_${fakeCID}`;
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      content: fileContent,
      fileName: fileName,
      uploadedAt: Date.now(),
    }),
  );

  return fakeCID;
}

// Retrieve file from local storage (mock IPFS)
export function getLocalFile(
  cid: string,
): { content: string; fileName: string; uploadedAt: number } | null {
  const storageKey = `ipfs_${cid}`;
  const data = localStorage.getItem(storageKey);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
}

export function downloadFileFromCID(cid: string): boolean {
  const fileData = getLocalFile(cid);

  if (!fileData) {
    console.error(`File not found for CID: ${cid}`);
    return false;
  }

  const lines = fileData.content.split("\n");
  const parsedContent = {
    description: lines[0] || "",
    issuedTo: lines[1]?.replace("Issued to: ", "") || "",
    date: lines[2]?.replace("Date: ", "") || "",
  };

  const jsonContent = JSON.stringify(
    {
      content: parsedContent,
      fileName: fileData.fileName,
      uploadedAt: fileData.uploadedAt,
    },
    null,
    2, // pretty formatting :)
  );

  const blob = new Blob([jsonContent], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileData.fileName.endsWith(".json")
    ? fileData.fileName
    : `${fileData.fileName}.json`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}

// getAllCertificates returns a list of all certificates. It uses multiple parallel requests to make requesting certs from the node much faster, but will run into issues when the number of certs is really large.
export async function getAllCertificates(): Promise<Certificate[]> {
  const contract = getCertificatesContract();
  const total = await contract.getTotalCertificates();

  const serialNumberPromises = [];
  for (let i = 0; i < Number(total); i++) {
    serialNumberPromises.push(contract.allSerialNumbers(i));
  }
  const serialNumbers = await Promise.all(serialNumberPromises);

  const certPromises = serialNumbers.map(async (serialNumber) => {
    const cert = await contract.getCertificate(serialNumber);
    return {
      serialNumber: cert[0],
      ipfsCID: cert[1],
      certificateHash: cert[2],
      owner: cert[3],
      timestamp: cert[4],
      revoked: cert[5],
    };
  });

  return await Promise.all(certPromises);
}
