  import React, { useState, useEffect, useMemo, type JSX } from "react";
  import { createFileRoute } from "@tanstack/react-router";
  import { AlertTriangle, XCircle, CheckCircle, Trash2 } from "lucide-react";
  import * as styles from "@/lib/styles";
  import {
    getCertificatesContract,
    getCertificatesContractWithSigner,
    getAllCertificates,
    type Certificate,
  } from "@/lib/contracts-utils";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select.tsx";
  import { JsonRpcProvider } from "ethers";

  type RevokeResult = {
    success: boolean;
    message: string;
    txHash?: string;
    serialNumber?: string;
    domain?: string;
  };

  // ---- PAGE COMPONENT ----
  function RevokeCertificate(): JSX.Element {
    const [selectedWallet, setSelectedWallet] = useState<string>("");
    const [wallets, setWallets] = useState<string[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [selectedSerial, setSelectedSerial] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingCerts, setLoadingCerts] = useState<boolean>(true);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [result, setResult] = useState<RevokeResult | null>(null);

    // Load wallets and certificates on mount
    useEffect(() => {
      loadWallets();
      loadCertificates();
    }, []);

    const loadWallets = async () => {
      try {
        setLoading(true);
        const provider = new JsonRpcProvider("http://127.0.0.1:8545");
        const accounts: string[] = [];

        for (let i = 0; i < 10; i++) {
          try {
            const signer = await provider.getSigner(i);
            const address = await signer.getAddress();
            accounts.push(address);
          } catch {
            break;
          }
        }

        setWallets(accounts);
      } catch (error) {
        console.error("Error loading wallets:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadCertificates = async () => {
      try {
        setLoadingCerts(true);
        setCertificates(await getAllCertificates());
      } catch (error) {
        console.error("Error loading certificates:", error);
      } finally {
        setLoadingCerts(false);
      }
    };

    // Filter certificates by selected wallet and show only active (non-revoked)
    const filteredCertificates = useMemo(() => {
      let filtered = certificates;

      // Filter by wallet if selected
      if (selectedWallet) {
        filtered = filtered.filter(
          (certificate) => certificate.owner.toString() === selectedWallet.toString()
        );
      }

      // Filter to show only active (non-revoked) certificates
      return filtered.filter((cert) => !cert.revoked);
    }, [certificates, selectedWallet]);

    const handleRevoke = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!selectedSerial) {
        setResult({
          success: false,
          message: "Please select a certificate to revoke",
        });
        return;
      }

      // Show confirmation dialog
      setShowConfirm(true);
    };

    const confirmRevoke = async () => {
      setShowConfirm(false);
      setLoading(true);
      setResult(null);

      try {
        // Verify ownership (double-check)
        const contract = getCertificatesContract();
        const cert = await contract.getCertificate(selectedSerial);

        if (!selectedWallet) {
          setResult({
            success: false,
            message: "Please select a wallet first",
          });
          return;
        }

        if (cert[4] !== selectedWallet) {
          setResult({
            success: false,
            message: "You do not own this certificate",
          });
          return;
        }

        if (cert[6]) {
          setResult({
            success: false,
            message: "Certificate is already revoked",
          });
          return;
        }

        // Revoke on blockchain - get signer for the selected wallet
        const provider = new JsonRpcProvider("http://127.0.0.1:8545");
        const walletIndex = wallets.indexOf(selectedWallet);
        const signer = await provider.getSigner(walletIndex);
        const contractWithSigner = await getCertificatesContractWithSigner(signer);
        const tx = await contractWithSigner.revokeCertificate(selectedSerial);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        setResult({
          success: true,
          message: "Certificate revoked successfully!",
          txHash: receipt.hash,
          serialNumber: selectedSerial,
        });

        // Reload certificates to update the list
        await loadCertificates();

        // Clear selection
        setSelectedSerial("");
      } catch (err) {
        console.error("Revoke error:", err);
        setResult({
          success: false,
          message: err instanceof Error ? err.message : "Failed to revoke certificate",
        });
      } finally {
        setLoading(false);
      }
    };

    const cancelRevoke = () => {
      setShowConfirm(false);
    };

    const parseDate = (timestamp: bigint) => {
      const date = new Date(Number(timestamp) * 1000);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    return (
      <div className={styles.CONTAINER}>
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className={`${styles.ICON_MEDIUM} ${styles.ICON_DESTRUCTIVE}`} />
          <h2 className={styles.HEADING_LARGE}>Revoke Certificate</h2>
        </div>

        {/* Wallet Selector */}
        <div className="flex justify-center items-center mb-4 gap-2">
          <label>Select a wallet: </label>
          <Select value={selectedWallet} onValueChange={setSelectedWallet}>
            <SelectTrigger className="">
              <SelectValue placeholder="---" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet} value={wallet}>
                  {wallet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={styles.CARD}>
          {/* User Info */}
          {selectedWallet && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className={styles.TEXT_SMALL}>Selected Wallet</p>
              <p className={`${styles.TEXT_MONO} text-sm mt-1`}>
                {selectedWallet}
              </p>
            </div>
          )}

          {/* Loading State */}
          {loadingCerts ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className={styles.SPINNER} />
              <p className={`${styles.TEXT_SMALL} mt-4`}>Loading certificates...</p>
            </div>
          ) : filteredCertificates.length === 0 ? (
            /* No Certificates */
            <div className="text-center py-12">
              <AlertTriangle className={`${styles.ICON_LARGE} ${styles.ICON_MUTED} mx-auto mb-4`} />
              <p className="text-lg font-semibold mb-2">No Active Certificates</p>
              <p className={styles.TEXT_SMALL}>
                {selectedWallet
                  ? "This wallet doesn't have any active certificates to revoke."
                  : "Select a wallet to view certificates."}
              </p>
            </div>
          ) : (
            /* Revoke Form */
            <form onSubmit={handleRevoke} className={styles.SECTION_SPACING}>
              <div>
                <label className={styles.LABEL}>
                  Select Certificate to Revoke ({filteredCertificates.length} active)
                </label>

                {/* Certificate Selection - Radio Buttons */}
                <div className="space-y-3">
                  {filteredCertificates.map((cert) => (
                    <label
                      key={cert.serialNumber}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSerial === cert.serialNumber
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="certificate"
                        value={cert.serialNumber}
                        checked={selectedSerial === cert.serialNumber}
                        onChange={(e) => setSelectedSerial(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`${styles.TEXT_MONO} text-sm font-semibold break-all`}>
                          {cert.serialNumber}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Registered: {parseDate(cert.timestamp)}</span>
                          <span className="text-green-600 dark:text-green-400">● Active</span>
                        </div>
                        <p className={`${styles.TEXT_MONO} text-xs mt-2 text-muted-foreground break-all`}>
                          Hash: {cert.certificateHash.slice(0, 20)}...
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Manual Serial Input */}
                <details className="mt-4">
                  <summary className={`${styles.TEXT_SMALL} cursor-pointer hover:text-foreground`}>
                    Or enter serial number manually
                  </summary>
                  <input
                    type="text"
                    value={selectedSerial}
                    onChange={(e) => setSelectedSerial(e.target.value)}
                    placeholder="CERT-1764377247323-certcrt"
                    className={`${styles.INPUT_MONO} mt-2`}
                  />
                </details>
              </div>

              {/* Warning Message */}
              <div className={styles.ALERT_WARNING}>
                <div className="flex gap-2">
                  <AlertTriangle className={`${styles.ICON_SMALL} ${styles.ICON_DESTRUCTIVE} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="font-semibold text-sm">Warning: This action cannot be undone</p>
                    <p className="text-sm mt-1">
                      Once revoked, the certificate will be permanently marked as invalid on the blockchain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedSerial}
                className={styles.BUTTON_DESTRUCTIVE}
              >
                {loading ? (
                  <>
                    <div className={styles.SPINNER} />
                    Revoking...
                  </>
                ) : (
                  <>
                    <Trash2 className={styles.ICON_SMALL} />
                    Revoke Certificate
                  </>
                )}
              </button>
            </form>
          )}

          {/* Confirmation Modal */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card border-2 border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="text-destructive flex-shrink-0" size={32} />
                  <div>
                    <h3 className="text-lg font-bold">Confirm Revocation</h3>
                    <p className={`${styles.TEXT_SMALL} mt-1`}>
                      Are you sure you want to revoke this certificate?
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Serial Number:</p>
                  <p className={`${styles.TEXT_MONO} text-sm break-all`}>{selectedSerial}</p>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  This action is <strong>permanent</strong> and cannot be undone. The certificate
                  will be marked as revoked on the blockchain.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={cancelRevoke}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRevoke}
                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg font-medium 
  transition-colors"
                  >
                    Yes, Revoke It
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Result Message */}
          {result && (
            <div
              className={result.success ? styles.MESSAGE_SUCCESS : styles.MESSAGE_ERROR}
            >
              <div className="flex gap-2">
                {result.success ? (
                  <CheckCircle className={`${styles.ICON_SMALL} ${styles.ICON_SUCCESS}`} />
                ) : (
                  <XCircle className={`${styles.ICON_SMALL} ${styles.ICON_DESTRUCTIVE}`} />
                )}
                <div className="w-full">
                  <p className="font-semibold">{result.message}</p>
                  {result.serialNumber && (
                    <p className={`${styles.TEXT_MONO} mt-1 text-sm`}>
                      Serial: {result.serialNumber}
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
  export const Route = createFileRoute("/certs/revoke")({
    component: RevokeCertificate,
  });
