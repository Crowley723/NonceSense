import {
  Contract,
  JsonRpcProvider,
  JsonRpcSigner,
  keccak256,
  toUtf8Bytes,
} from "ethers";
import CertificatesABI from "../contracts/Certificates.json";
import deployedAddresses from "../contracts/deployed_addresses.json";
import { initHelia } from './ipfs-client';
import { CID } from 'multiformats/cid';

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
  return `CERT-${Date.now()}-${fileName.replace(/[^a-zA-Z0-9]/g, '')}`;
}

// IPFS upload
export async function IPFSUpload(fileContent: string): Promise<string> {
  const { fs } = await initHelia();

  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const bytes = encoder.encode(fileContent);

  // Add file to IPFS
  const cid = await fs.addBytes(bytes);

  // Return CID as string
  return cid.toString();

}

// Retrieve file from IPFS
export async function getIPFSFile(cidString: string): Promise<string | null> {
  try {
    const { fs } = await initHelia();

    // Parse string to CID object - this fixes the TypeScript error
    const cid = CID.parse(cidString);

    const chunks: Uint8Array[] = [];
    for await (const chunk of fs.cat(cid)) {  // Now accepts CID object
      chunks.push(chunk);
    }

    // Concatenate all chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const allBytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      allBytes.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(allBytes);
  } catch (error) {
    console.error('Failed to retrieve from IPFS:', error);
    return null;
  }

}


export async function downloadFileFromCID(cid: string): Promise<boolean> {
  const fileContent = await getIPFSFile(cid);

  if (!fileContent) {
    console.error(`File not found for CID: ${cid}`);
    return false;
  }

  const lines = fileContent.split("\n");
  const parsedContent = {
    description: lines[0] || "",
    issuedTo: lines[1]?.replace("Issued to: ", "") || "",
    date: lines[2]?.replace("Date: ", "") || "",
  };

  const jsonContent = JSON.stringify(
    {
      content: parsedContent,
      cid: cid,
      downloadedAt: new Date().toISOString(),
    },
    null,
    2, // pretty formatting :)
  );

  const blob = new Blob([jsonContent], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `certificate-${cid.slice(0, 8)}.json`;

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
