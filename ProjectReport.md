# CSC196D: Project Report
## Nonce Sense - Decentralized PKI on Blockchain

| Member          | Responsibilities                                                                                                                                            |
| --------------- |-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Brynn Crowley   | Initialized project structure, developed core Certificate contract, implemented frontend routes, and ui components for viewing and validating certificates. |
| Marcos Pantoja  | Implemented local IPFS using Helia, Web3 Integration, smart contract development, created contracts-utils.ts, new.tsx, revoke.tsx                           |
| Daniel Agafonov | TODO                                                                                                                                                        |

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

### Tech Stack

| Layer           | Technology                                               |
| --------------- |----------------------------------------------------------|
| Frontend        | React 19, TypeScript, Vite                               |
| Smart Contracts | Solidity, Hardhat 3, ethers.js                           |
| Testing         | Solidity (Foundry Format)                                |
| Deployment      | Hardhat Ignition                                         |
| Storage         | IPFS (off-chain via Helia), Ethereum (on-chain metadata) |

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

![mermaid-drawing.svg](./Images/registration-flow-diagram.svg)

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

This web application provides three main pages to manage certificates:

**Upload Page (`/certs/new`)** 
The purpose of this page is for users to register a new certificate on the blockchain. It allows a user to upload a .pem, .crt, or .cer file to be stored via IPFS. Once the certificate is registered it is assigned a serial number, shows the Domain that is registered, the IPFS string, and the blockchain transaction number.

![Pasted image 20251130002406.png](./Images/Pasted%20image%2020251130002406.png)

**View Page (`/certs/view`)**
The purpose of this page is to view all registered certificates across all wallets as well as individual wallets through a drop-down. Each certificate card shows a status badge that shows whether that certificate is valid or revoked, a download button that allows you to retrieve the file from IFPS, a registration timestamp, the owner of the certificate, the domain name, and finally a details sub tab that has more information on the certificate such as the certificates serial number.

![Pasted image 20251130003618.png](./Images/Pasted%20image%2020251130003618.png)

**Revoke Page (`/certs/revoke`)**
The purpose of the certificate revocation page is to revoke registered certificates from the blockchain. The application allows you to select a wallet through the drop-down to revoke certificates on that specific wallet. There is then a selection page for active certificates as well as a manual serial number entry method of revocation. 

![Pasted image 20251130004323.png](./Images/Pasted%20image%2020251130004323.png)

Paired with the revocation page is a confirmation page that when you click revoke, allows you to confirm the serial number and then revoke the certificate.

![Pasted image 20251130004718.png](./Images/Pasted%20image%2020251130004718.png)

---
## Smart Contract Functions

**registerCertificate(domain, serialNumber, ipfsCID, certificateHash)**
- Registers a new certificate on the blockchain
- Validates all required parameters are non-empty
- Ensures certificate is not already registered
- Stores certificate metadata including domain, owner address and timestamp
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
- Returns: domain, serialNumber, ipfsCID, certificateHash, owner, timestamp, revoked status
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

**On-Chain (expensive, small data):**
- Domain name (CN from certificate)
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

![validation-flow-diagram.png](./Images/validation-flow-diagram.svg)

Terminal 2 - Deploy and run frontend:
```bash
pnpm build:contracts
pnpm deploy:local
pnpm dev
```

The web interface will be available at `http://localhost:5173`.

---
## Available Commands

| Command                | Description                    |
| ---------------------- |--------------------------------|
| `pnpm dev`             | + Start development web server |
| `pnpm dev:contracts`   | + Start local Hardhat node     |
| `pnpm build`           | Build web app for production   |
| `pnpm build:contracts` | Compile smart contracts        |
| `pnpm test`            | Run all tests                  |
| `pnpm test:contracts`  | Run contract tests only        |
| `pnpm deploy:local`    | + Deploy to local network      |
| `pnpm clean`           | Clean build artifacts          |

\+ These should be run in sequence to run our application locally.

---
## Challenges and Outcomes

**Accomplishments**
In terms of our accomplishments we were able to implement the end-to-end certificate life cycle of registration, verification, revocation. We were also successfully able to create a fully  functioning smart contract with Solidity tests. This smart contract successfully stores, returns and revokes the certificates stored on the blockchain. We were able to build an interactive UI that allowed for the revocation, registration and verification of certificates through an easy-to-use UI. We were able to successfully integrate IPFS using Helia for decentralized storage that in our PoC stores locally. Overall we were able to achieve a transparent, immutable certificate management using blockchain technologies. 

**Challenges Faced**
We ran into some minor issues with our initial design, we didn't properly map out what our application was going to look like and do. And as a result, each teammate had their own ideas about what the UI should look like and do.

**Remaining Work**
- Currently, we use a local non-persistent Helia node for IPFS. In production, we would need to use a public IPFS network (including Helia)
- To move this to a better spot, increasing the test coverage for the smart contract and the frontend would be useful

---

## Conclusion

Nonce Sense demonstrates the feasibility of replacing centralized Certificate authorities with blockchain-based certificate validation. Our implementation shows that despite various issues related to the design of TLS certificates that don't lend them to being decentralized, it is possible to use traditional certificates on a decentralized blockchain.

We achieved our goals with this project, implementing end-to-end certificate lifecycle management, integration IPFS for off-chain storage of certificates, and building a user interface to enable visualization of the concepts involved.

Some additional improvements could be made to make the smart contract work more efficiently at a lower gas cost, but that is out of scope for this proof of concept.

---
## Disclaimer

This is a proof-of-concept implementation intended for educational purposes. It runs on a local test network and is not production-ready.

---
## GitHub Repository

https://github.com/Crowley723/NonceSense