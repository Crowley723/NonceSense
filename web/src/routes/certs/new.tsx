import React, { useState, type JSX } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Upload, XCircle, CheckCircle, FileText } from 'lucide-react';
import * as styles from '@/lib/styles';
import {
  getCertificatesContractWithSigner,
  hashCertificate,
  generateSerialNumber,
  IPFSUpload,
} from '@/lib/contracts-utils';

type UploadResult = {
  success: boolean;
  message: string;
  txHash?: string;
  serialNumber?: string;
  ipfsCID?: string;
};

// ---- PAGE COMPONENT ----
function UploadCertificate(): JSX.Element {
  const [certFile, setCertFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setCertFile(file ?? null);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!certFile) {
      setResult({ success: false, message: 'Please select a certificate file.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Read file content
      const fileContent = await certFile.text();

      // Generate hash and serial number
      const certificateHash = hashCertificate(fileContent);
      const serialNumber = generateSerialNumber(certFile.name);

      // IPFS upload - stores in local IPFS node and returns CID
      const ipfsCID = await IPFSUpload(fileContent);
      console.log('IPFS CID:', ipfsCID);

      // Get contract instance
      const contract = await getCertificatesContractWithSigner();

      // Register certificate on blockchain
      const tx = await contract.registerCertificate(
        serialNumber,
        ipfsCID,
        certificateHash
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      setResult({
        success: true,
        message: 'Certificate registered successfully!',
        txHash: receipt.hash,
        serialNumber: serialNumber,
        ipfsCID: ipfsCID,
      });

      // Clear file input
    } catch (err) {
      console.error('Upload error:', err);
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to upload certificate',
      });
    } finally {
      setLoading(false);
      setCertFile(null);
    }
  };

  return (
    <div className={styles.CONTAINER}>
      <div className="flex items-center gap-3 mb-6">
        <Upload className={`${styles.ICON_MEDIUM} ${styles.ICON_PRIMARY}`} />
        <h2 className={styles.HEADING_LARGE}>Upload Certificate</h2>
      </div>

      <div className={styles.CARD}>

        <form onSubmit={handleUpload} className={styles.SECTION_SPACING}>
          <div>
            <label className={styles.LABEL}>Certificate File (.pem, .crt)</label>
            <div className={styles.FILE_UPLOAD_AREA}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pem,.crt,.cer"
                className="sr-only"
                id="cert-upload"
                required
              />
              <label htmlFor="cert-upload" className="cursor-pointer">
                <FileText className={`${styles.ICON_LARGE} ${styles.ICON_MUTED} mx-auto mb-2`} />
                <p className={styles.TEXT_SMALL}>
                  {certFile ? certFile.name : 'Click to upload certificate'}
                </p>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.BUTTON_PRIMARY}
          >
            {loading ? (
              <>
                <div className={styles.SPINNER} />
                Uploading...
              </>
            ) : (
              <>
                <Upload className={styles.ICON_SMALL} />
                Upload Certificate
              </>
            )}
          </button>
        </form>

        {result && (
          <div className={result.success ? styles.MESSAGE_SUCCESS : styles.MESSAGE_ERROR}>
            <div className="flex gap-2">
              {result.success ? (
                <CheckCircle className={`${styles.ICON_SMALL} ${styles.ICON_SUCCESS}`} />
              ) : (
                <XCircle className={`${styles.ICON_SMALL} ${styles.ICON_DESTRUCTIVE}`} />
              )}
              <div className="w-full">
                <p className="font-semibold">
                  {result.message}
                </p>
                {result.serialNumber && (
                  <p className={`${styles.TEXT_MONO} mt-1 text-sm`}>
                    Serial: {result.serialNumber}
                  </p>
                )}
                {result.ipfsCID && (
                  <p className={`${styles.TEXT_MONO} mt-1 text-sm break-all`}>
                    IPFS: {result.ipfsCID}
                  </p>
                )}
                {result.txHash && (
                  <p className={`${styles.TEXT_MONO} mt-1 text-sm`}>
                    Tx: {result.txHash.slice(0, 16)}...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- ROUTE ----
export const Route = createFileRoute('/certs/new')({
  component: UploadCertificate,
});
