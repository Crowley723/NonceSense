
import { Contract, JsonRpcProvider, keccak256, toUtf8Bytes } from "ethers";
import CertificatesABI from "../contracts/Certificates.json";
import deployedAddresses from "../contracts/deployed_addresses.json";
import { initHelia } from './ipfs-client';
import { CID } from 'multiformats/cid';

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
  return new Contract(CERTIFICATES_ADDRESS, CertificatesABI, provider);
}

// Get contract instance for writing
export async function getCertificatesContractWithSigner() {
  const signer = await getSigner();
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