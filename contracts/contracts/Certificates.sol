// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Certificates {
    struct Certificate {
        string serialNumber;
        string ipfsCID;
        bytes32 certificateHash;
        address owner;
        uint256 timestamp;
        bool revoked;
    }

    // certificates maps a serial number to a specific certificate
    mapping(string => Certificate) public certificates;

    // ownerCertificates maps an owner's address to their certificate's serial numbers
    mapping(address => string[]) public ownerCertificates;

    // allSerial numbers represents a list of all expired, valid, and revoked certificate serial numbers.
    string[] public allSerialNumbers;

    // CertificateRegistered is thrown when a certificate is added to the chain
    event CertificateRegistered(
        string indexed serialNumber,
        string ipfsCID,
        bytes32 certificateHash,
        address indexed owner,
        uint256 timestamp
    );

    // CertificateRevoked is thrown when a certificate is revoked
    event CertificateRevoked(
        string indexed serialNumber,
        address indexed revokedBy,
        uint256 timestamp
    );

    //registerCertificate is used for adding a new certificate to the chain of trust
    function registerCertificate(
        string memory serialNumber,
        string memory ipfsCID,
        bytes32 certificateHash
    ) public {
        require(bytes(serialNumber).length > 0, "Serial number cannot be empty");
        require(bytes(ipfsCID).length > 0, "IPFS CID cannot be empty");
        require(certificateHash != bytes32(0), "Certificate hash cannot be empty");
        require(bytes(certificates[serialNumber].serialNumber).length == 0, "Certificate already registered");

        Certificate memory cert = Certificate({
            serialNumber: serialNumber,
            ipfsCID: ipfsCID,
            certificateHash: certificateHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            revoked: false
        });

        certificates[serialNumber] = cert;
        ownerCertificates[msg.sender].push(serialNumber);
        allSerialNumbers.push(serialNumber);

        emit CertificateRegistered(
            serialNumber,
            ipfsCID,
            certificateHash,
            msg.sender,
            block.timestamp
        );
    }

    //revokeCertificate allows the owner of a certificate to mark it as no longer trusted
    function revokeCertificate(string memory serialNumber) public {
        Certificate storage cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate does not exist");
        require(cert.owner == msg.sender, "Only the certificate owner can revoke it");
        require(!cert.revoked, "Certificate already revoked");

        cert.revoked = true;

        emit CertificateRevoked(serialNumber, msg.sender, block.timestamp);
    }

    // getCertificate allows retrieval of a certificate by its serial number
    function getCertificate(string memory serialNumber) public view returns (
        string memory,
        string memory,
        bytes32,
        address,
        uint256,
        bool
    ) {
        Certificate memory cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate does not exist");

        return (
            cert.serialNumber,
            cert.ipfsCID,
            cert.certificateHash,
            cert.owner,
            cert.timestamp,
            cert.revoked
        );
    }

    // isValid is the main way to validate that a certificate is still valid and not revoked
    function isValid(string memory serialNumber, bytes32 certificateHash) public view returns (bool) {
        Certificate memory cert = certificates[serialNumber];
        return bytes(cert.serialNumber).length > 0 && !cert.revoked && cert.certificateHash == certificateHash;
    }

    // getOwnerCertificates returns a list of all certificate associated with a specific owner address
    function getOwnerCertificates(address owner) public view returns (string[] memory) {
        return ownerCertificates[owner];
    }

    // getTotalCertificates return the total number of certificates on the chain, revoked and valid.
    function getTotalCertificates() public view returns (uint256) {
        return allSerialNumbers.length;
    }
}
