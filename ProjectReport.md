# CSC196D: Project Report
## Nonce Sense - Decentralized PKI on Blockchain

| Member          | Responsibilities |
| --------------- | ---------------- |
| Brynn Crowley   | TODO             |
| Marcos Pantoja  | TODO             |
| Daniel Agafonov | TODO             |

## Introduction

A proof-of-concept decentralized application that replaces centralized Certificate Authority (CA) trust with blockchain-based certificate validation.

Traditional Public Key Infrastructure (PKI) relies on centralized Certificate Authorities like Verisign and DigiCert to validate TLS certificates. These authorities represent single points of failure, can be compromised, and require implicit trust from all parties. Certificate revocation through OCSP and CRL mechanisms is slow and often unreliable.

Nonce Sense reimagines this architecture by leveraging blockchain technology to create a trustless, decentralized system for TLS certificate validation. Website operators can register their own certificates on-chain after proving domain ownership through DNS challenges. Clients validate certificates directly against the blockchain without relying on any central authority. This approach ensures transparency, instant revocation, and tamper-proof certificate history.

---

## Motivation

The current CA-based PKI model has several fundamental problems:

1. Users must implicitly trust dozens of root CAs bundled in their browsers. A single compromised CA can issue fraudulent certificates for any domain.
2. When certificates need to be revoked, OCSP and CRL mechanisms are slow, often cached incorrectly, and browsers frequently fail-open when revocation checks fail.
3. Certificate issuance is not public and there's no public audit trail of what certificates a CA has issued.
4. If a major CA goes offline or is compromised, the entire trust chain breaks.

Nonce Sense addresses these concerns through a decentralized model. By moving certificate validation to the blockchain, we achieve transparent and auditable certificate registrations, instant revocation with no propagation delays, elimination of trusted third parties, and an immutable certificate history that cannot be tampered with.

---

## System Actors & Design

**Website Provider (Server)**
- Generates their own TLS certificate
- Registers it on the blockchain
- Proves domain ownership via DNS-01 challenge
- Serves the certificate to clients

**DNS Service (Existing Infrastructure)**
- Provides the proof-of-ownership mechanism
- Website provider adds TXT records to prove domain control
- Leverages existing decentralized DNS infrastructure

**User's Browser/Client**
- Validates certificates by querying the blockchain
- Checks fingerprint, revocation status, and expiration
- Displays trust indicator to user

**Smart Contract**
- Manages certificate registration challenges
- Verifies DNS ownership proofs
- Stores certificate metadata on-chain
- Handles certificate revocation

(Mermaid Diagram Here)

### Tech Stack

| Layer           | Technology                                     |
| --------------- | ---------------------------------------------- |
| Frontend        | React 19, TypeScript, Vite                     |
| Smart Contracts | Solidity, Hardhat 3, ethers.js                 |
| Testing         | Solidity (Foundry Format)                      |
| Deployment      | Hardhat Ignition                               |
| Storage         | IPFS (off-chain), Ethereum (on-chain metadata) |

### Project Structure
```
noncesense/
├── contracts/          # Hardhat 3 smart contracts
│   ├── contracts/     # Solidity source files
│   ├── test/              # Contract tests
│   ├── scripts/         # Deployment scripts
│   └── ignition/        # Hardhat Ignition modules
│
└── web/                  # React + Vite frontend
    ├── src/                # React application
    └── public/           # Static assets
```

---
## Registration Flow

(Mermaid Diagram Here)

**Step 1: Request Registration**
Website provider calls the smart contract to register a certificate for their domain. The contract returns a challenge ID and a random nonce value.

**Step 2: Prove Domain Ownership**
Website provider adds a DNS TXT record at `_blockchain-cert.example.com` containing the nonce. This proves they control the domain since only the domain owner can modify DNS records.

**Step 3: Submit Certificate**
Website provider submits their certificate to the smart contract with the challenge ID. The contract verifies the DNS TXT record matches the expected nonce, parses certificate metadata (fingerprint, validity period, key usage), stores the full certificate on IPFS, and stores only metadata on-chain.

**Step 4: Client Validation**
When a user visits the website, the browser receives the certificate during TLS handshake, calculates the certificate fingerprint, queries the blockchain for the valid certificate for that domain, and compares the fingerprint, revocation status, and validity period.

---
## User Interface Overview

TODO

---
## Smart Contract Functions

**registerCertificate(serialNumber, ipfsCID, certificateHash)**
- Registers a new certificate on the blockchain
- Validates all required parameters are non-empty
- Ensures certificate is not already registered
- Stores certificate metadata including owner address and timestamp
- Associates certificate with owner's address
- Adds serial number to global list of all certificates
- Emits CertificateRegistered event
  
**revokeCertificate(serialNumber)**
- Only callable by the certificate owner
- Marks the certificate as revoked
- Validates certificate exists and is not already revoked
- Emits CertificateRevoked event
- Instant effect with no propagation delay

**getCertificate(serialNumber)**
- Retrieves complete certificate information by serial number
- Returns: serialNumber, ipfsCID, certificateHash, owner, timestamp, revoked status
- Requires certificate to exist
- View function (no gas cost when called externally)

**isValid(serialNumber, certificateHash)**
- Primary validation function for certificate verification
- Checks if certificate exists on the blockchain
- Verifies certificate is not revoked
- Confirms certificate hash matches the registered hash
- Returns boolean validation result
- View function (no gas cost when called externally)

**getOwnerCertificates(owner)**
- Returns array of all certificate serial numbers for a specific owner address
- Useful for displaying all certificates owned by a wallet
- View function (no gas cost when called externally)

**getTotalCertificates()**
- Returns total count of all certificates on the blockchain
- Includes revoked and valid certificates
- View function (no gas cost when called externally)

---
## Data Storage Strategy

(Mermaid Diagram Here)

**On-Chain (expensive, small data):**
- Certificate fingerprint (SHA-256 hash)
- Domain name
- Validity dates (notBefore, notAfter)
- IPFS content hash
- Revocation status
- Owner address

**Off-Chain IPFS (cheap, large data):**
- Full certificate in PEM format
- Complete certificate chain
- Extended metadata

This approach keeps gas costs low while maintaining full certificate data availability.

---
## Client Validation Flow

(Mermaid Diagram Here)

---
## Setup and Development

**Prerequisites**
- Node.js v18 or higher
- pnpm v10.6.4 or compatible

**Installation**
```bash
pnpm install
```

**Development (requires 2 terminals)**

Terminal 1 - Start local blockchain:
```bash
pnpm dev:contracts
```

Terminal 2 - Deploy and run frontend:
```bash
pnpm build:contracts
pnpm deploy:local
pnpm dev
```

The web interface will be available at `http://localhost:5173`.

---
## Available Commands

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `pnpm dev`             | Start web development server |
| `pnpm dev:contracts`   | Start local Hardhat node     |
| `pnpm build`           | Build web app for production |
| `pnpm build:contracts` | Compile smart contracts      |
| `pnpm test`            | Run all tests                |
| `pnpm test:contracts`  | Run contract tests only      |
| `pnpm deploy:local`    | Deploy to local network      |
| `pnpm clean`           | Clean build artifacts        |

---
## Challenges and Outcomes

**Accomplishments**
- TODO

**Challenges Faced**
- TODO

**Remaining Work**
- TODO

---

## Conclusion

Nonce Sense demonstrates …

TODO

This is a proof-of-concept implementation intended for educational purposes. It runs on a local test network and is not production-ready.

---
## GitHub Repository

https://github.com/Crowley723/NonceSense