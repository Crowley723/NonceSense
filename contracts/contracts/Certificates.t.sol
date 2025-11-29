// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Certificates} from "./Certificates.sol";
import {Test} from "forge-std/Test.sol";

// Solidity tests are compatible with foundry, so they
// use the same syntax and offer the same functionality.

contract CertificatesTest is Test {
  Certificates certificates;

    function setUp() public {
        certificates = new Certificates();
    }

    function test_InitialCertNumber() public view {
        require(certificates.getTotalCertificates() == 0, "Initial number of certs should be 0");
    }

    function CertificateRegistersSuccessfully() public {
        string memory domain = "example.com";
        string memory serialNumber = "abc1234";
        string memory ipfsCID = "fake-ipfs-cid";
        bytes32 certificateHash = keccak256("test-cert-hash");

        certificates.registerCertificate(domain, serialNumber, ipfsCID, certificateHash);

        require(certificates.getTotalCertificates() == 1, "Should have 1 certificate");

        (
            string memory retDomain,
            string memory retSerial,
            string memory retIpfs,
            bytes32 retHash,
            address retOwner,
            uint256 retTimestamp,
            bool retRevoked
        ) = certificates.getCertificate(serialNumber);

        require(keccak256(bytes(retDomain)) == keccak256(bytes(domain)), "Domain mismatch");
        require(keccak256(bytes(retSerial)) == keccak256(bytes(serialNumber)), "Serial number mismatch");
        require(keccak256(bytes(retIpfs)) == keccak256(bytes(ipfsCID)), "IPFS CID mismatch");
        require(retHash == certificateHash, "Certificate hash mismatch");
        require(retOwner == address(this), "Owner mismatch");
        require(!retRevoked, "Certificate should not be revoked");
        require(retTimestamp > 0, "Timestamp should be set");
    }

    function test_RevertOnEmptyDomain() public {
        vm.expectRevert("Domain name cannot be empty");
        certificates.registerCertificate("", "cert001", "QmHash", keccak256("hash"));
    }

    function test_RevertOnEmptySerialNumber() public {
        vm.expectRevert("Serial number cannot be empty");
        certificates.registerCertificate("example.com", "", "QmHash", keccak256("hash"));
    }

    function test_RevertOnEmptyIPFS() public {
        vm.expectRevert("IPFS CID cannot be empty");
        certificates.registerCertificate("example.com", "cert001", "", keccak256("hash"));
    }

    function test_RevertOnEmptyHash() public {
        vm.expectRevert("Certificate hash cannot be empty");
        certificates.registerCertificate("example.com", "cert001", "QmHash", bytes32(0));
    }

    function test_RevertOnDuplicateRegistration() public {
        string memory serial = "cert001";
        certificates.registerCertificate("example.com", serial, "QmHash", keccak256("hash"));

        vm.expectRevert("Certificate already registered");
        certificates.registerCertificate("different.com", serial, "QmHash2", keccak256("hash2"));
    }

    function testFuzz_RegisterCertificate(
        string memory domain,
        string memory serialNumber,
        string memory ipfsCID,
        bytes32 certificateHash
    ) public {
        vm.assume(bytes(domain).length > 0);
        vm.assume(bytes(serialNumber).length > 0);
        vm.assume(bytes(ipfsCID).length > 0);
        vm.assume(certificateHash != bytes32(0));

        certificates.registerCertificate(domain, serialNumber, ipfsCID, certificateHash);

        require(certificates.getTotalCertificates() == 1, "Should have 1 certificate");
        require(certificates.isValid(serialNumber, certificateHash), "Certificate should be valid");
    }

    function test_CertificateRevokesSuccessfully() public {
        string memory domain = "example.com";
        string memory serialNumber = "abc1234";
        string memory ipfsCID = "fake-ipfs-cid";
        bytes32 certificateHash = keccak256("test-cert-hash");

        certificates.registerCertificate(domain, serialNumber, ipfsCID, certificateHash);
        require(certificates.getTotalCertificates() == 1, "Should have 1 certificate");

        // Verify initial state
        _verifyCertificateData(domain, serialNumber, ipfsCID, certificateHash, false);

        // Revoke the certificate
        certificates.revokeCertificate(serialNumber);

        // Verify revoked state
        _verifyCertificateData(domain, serialNumber, ipfsCID, certificateHash, true);
    }

    function _verifyCertificateData(
        string memory domain,
        string memory serialNumber,
        string memory ipfsCID,
        bytes32 certificateHash,
        bool shouldBeRevoked
    ) internal view {
        (
            string memory retDomain,
            string memory retSerial,
            string memory retIpfs,
            bytes32 retHash,
            address retOwner,
            uint256 retTimestamp,
            bool retRevoked
        ) = certificates.getCertificate(serialNumber);

        require(keccak256(bytes(retDomain)) == keccak256(bytes(domain)), "Domain mismatch");
        require(keccak256(bytes(retSerial)) == keccak256(bytes(serialNumber)), "Serial number mismatch");
        require(keccak256(bytes(retIpfs)) == keccak256(bytes(ipfsCID)), "IPFS CID mismatch");
        require(retHash == certificateHash, "Certificate hash mismatch");
        require(retOwner == address(this), "Owner mismatch");
        require(retRevoked == shouldBeRevoked, shouldBeRevoked ? "Should be revoked" : "Should not be revoked");
        require(retTimestamp > 0, "Timestamp should be set");
    }


}
