# Nonce Sense

> CSC196D - Introduction to Blockchain

A proof-of-concept decentralized application that replaces centralized Certificate Authority trust with blockchain-based certificate validation.

## Overview

Nonce Sense is an educational blockchain project that reimagines the traditional Public Key Infrastructure (PKI) by eliminating centralized Certificate Authorities. Instead, it leverages blockchain technology to create a trustless, decentralized system for TLS certificate validation.

### Key Features

- **Domain Ownership Verification**: DNS-01-style challenges ensure domains are controlled by certificate requestors
- **On-Chain Certificate Management**: Create, submit, and revoke TLS certificates stored on the blockchain
- **Client-Side Validation**: Validate certificates directly against the blockchain without relying on centralized authorities
- **Eliminates Single Points of Failure**: No central authority needed for trust validation

## Project Structure

This is a monorepo containing two main components:

```
noncesense/
├── contracts/          # Hardhat 3 smart contracts (Solidity)
│   ├── contracts/      # Smart contract source files
│   ├── test/           # Contract tests (Solidity + Mocha)
│   ├── scripts/        # Deployment and utility scripts
│   └── ignition/       # Hardhat Ignition deployment modules
│
└── web/                # React + Vite frontend
    ├── src/            # React application source
    └── public/         # Static assets
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v10.6.4 or compatible)

## Getting Started

### Installation

Install all dependencies across both workspaces:

```bash
pnpm install
```

### Development

You will need 2 terminals to run the chain + frontend.

#### Start the local blockchain test network:

```bash
pnpm dev:contracts
```

This will start a Hardhat node on `http://localhost:8545` with test accounts.

#### Build and deploy contracts (in a new terminal):

```bash
pnpm build:contracts
pnpm deploy:local
```

#### Start the web development server:

```bash
pnpm dev
```

The web interface will be available at `http://localhost:5173`.

## Available Scripts

### Root Commands

- `pnpm dev` - Start the web development server
- `pnpm dev:contracts` - Start local Hardhat blockchain node
- `pnpm build` - Build the web application for production
- `pnpm build:contracts` - Compile smart contracts
- `pnpm test` - Run all tests (contracts + web linting)
- `pnpm test:contracts` - Run contract tests
- `pnpm test:web` - Run web linting
- `pnpm deploy:local` - Deploy contracts to local network
- `pnpm deploy:sepolia` - Deploy contracts to Sepolia testnet
- `pnpm clean` - Clean all build artifacts

### Contracts Workspace

Navigate to `contracts/` directory or use:

- `cd contracts && pnpm compile` - Compile smart contracts
- `cd contracts && pnpm test` - Run all contract tests
- `cd contracts && pnpm test:solidity` - Run Solidity tests only
- `cd contracts && pnpm test:mocha` - Run Mocha tests only
- `cd contracts && pnpm node` - Start local blockchain node

### Web Workspace

Navigate to `web/` directory or use:

- `cd web && pnpm dev` - Start development server
- `cd web && pnpm build` - Build for production
- `cd web && pnpm lint` - Run ESLint
- `cd web && pnpm preview` - Preview production build

## Technology Stack

### Smart Contracts
- **Hardhat 3** - Ethereum development environment
- **Solidity** - Smart contract language
- **ethers.js** - Ethereum library
- **Mocha + Chai** - Testing framework

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting

## Educational Context

This project was created for CSC196D - Introduction to Blockchain. It serves as an educational demonstration of how blockchain technology can be applied to solve real-world trust and security challenges in the PKI ecosystem.

**Note**: This is a proof-of-concept implementation intended for educational purposes and runs on a local test network. It is not production-ready.

## Contributing

This is an educational project. If you're a fellow student or instructor, feel free to explore and learn from the codebase.

## License

ISC
