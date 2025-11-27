This doc is for storing the mermaid diagrams outside the `ProjectReport.md` file. Why? Becaue the program I use to render the .md file to pdf (Obsidian) renders mermaid diagrams that allows for overflow outside the page limits. Whe approach I went with is to render these mermaids indivisually as svg's (using a tool like [this](https://www.mermaidonline.live/mermaid-to-svg)) and then simply import them into the document. Same output, but without the hastle of trying to design a mermaid diagram that won't overlfow outside some boundries (sometimes impossible)

## System Design

```mermaid
flowchart LR
    subgraph Frontend
        React[React + Vite]
        TS[TypeScript]
    end
    
    subgraph Contracts
        Hardhat[Hardhat 3]
        Solidity[Solidity Contracts]
        Ignition[Hardhat Ignition]
    end
    
    subgraph Network
        LocalNode[Local Hardhat Node :8545]
    end
    
    subgraph External
        IPFS[(IPFS Storage)]
        DNS[DNS TXT Records]
    end
    
    React --> Solidity
    Solidity --> LocalNode
    Solidity --> IPFS
    Solidity --> DNS
```

## Registration Flow

```mermaid
sequenceDiagram
    participant WP as Website Provider
    participant SC as Smart Contract
    participant DNS as DNS Service
    participant IPFS as IPFS
    participant Chain as Blockchain

    WP->>SC: requestRegistration("example.com")
    SC->>WP: Return (challengeId, nonce)
    
    WP->>DNS: Add TXT record<br/>_blockchain-cert.example.com = nonce
    
    WP->>SC: submitCertificate(challengeId, certificate)
    SC->>DNS: Query TXT record
    DNS->>SC: Return nonce value
    
    alt Nonce matches
        SC->>SC: Parse certificate metadata
        SC->>IPFS: Store full certificate (PEM)
        IPFS->>SC: Return IPFS hash
        SC->>Chain: Store metadata on-chain
        SC->>WP: Registration successful
    else Nonce mismatch
        SC->>WP: Registration failed
    end
```

## Data Storage Strategy

```mermaid
flowchart TB
    subgraph OnChain[On-Chain - Ethereum]
        Fingerprint[Certificate Fingerprint]
        Domain[Domain Name]
        Validity[Validity Dates]
        IPFSHash[IPFS Hash]
        Revoked[Revocation Status]
        Owner[Owner Address]
    end
    
    subgraph OffChain[Off-Chain - IPFS]
        FullCert[Full Certificate PEM]
        Extensions[Certificate Extensions]
        Chain[Certificate Chain]
    end
    
    IPFSHash -.->|References| FullCert
```

## Client Validation Flow

```mermaid
flowchart TD
    A[Browser connects to website] --> B[Receive TLS certificate]
    B --> C[Calculate SHA-256 fingerprint]
    C --> D[Query blockchain for domain]
    D --> E{Certificate found?}
    
    E -->|No| F[Display untrusted warning]
    E -->|Yes| G{Fingerprint matches?}
    
    G -->|No| F
    G -->|Yes| H{Is revoked?}
    
    H -->|Yes| F
    H -->|No| I{Within validity period?}
    
    I -->|No| F
    I -->|Yes| J[Display trusted indicator]
```