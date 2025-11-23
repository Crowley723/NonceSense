
import { Contract, JsonRpcProvider, keccak256, toUtf8Bytes } from "ethers";
import CertificatesABI from "../../../contracts/artifacts/contracts/Certificates.sol/Certificates.json";
import deployedAddresses from "../../../contracts/ignition/deployments/chain-31337/deployed_addresses.json";


export const CERTIFICATES_ADDRESS = deployedAddresses["CertificatesModule#Certificates"];

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
  return new Contract(CERTIFICATES_ADDRESS, CertificatesABI.abi, provider);
}

// Get contract instance for writing
export async function getCertificatesContractWithSigner() {
  const signer = await getSigner();
  return new Contract(CERTIFICATES_ADDRESS, CertificatesABI.abi, signer);
}

// Hash certificate file content
export function hashCertificate(content: string): string {
  return keccak256(toUtf8Bytes(content));
}

// Generate serial number from file
export function generateSerialNumber(fileName: string): string {
  return `CERT-${Date.now()}-${fileName.replace(/[^a-zA-Z0-9]/g, '')}`;
}

// Mock IPFS upload - generates fake CID and stores locally
export function mockIPFSUpload(fileContent: string, fileName: string): string {
  // Generate a fake IPFS CID (looks like: Qm...)
  const contentHash = hashCertificate(fileContent).slice(2, 48); // Take part of hash
  const fakeCID = `Qm${contentHash}`;

  // Store file content locally in browser storage
  const storageKey = `ipfs_${fakeCID}`;
  localStorage.setItem(storageKey, JSON.stringify({
    content: fileContent,
    fileName: fileName,
    uploadedAt: Date.now()
  }));

  return fakeCID;
}

// Retrieve file from local storage (mock IPFS)
export function getLocalFile(cid: string): { content: string; fileName: string; uploadedAt: number } | null {
  const storageKey = `ipfs_${cid}`;
  const data = localStorage.getItem(storageKey);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
}
