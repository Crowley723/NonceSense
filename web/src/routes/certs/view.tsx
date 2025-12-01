import { createFileRoute } from "@tanstack/react-router";
import { CARD } from "@/lib/styles.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useEffect, useMemo, useState } from "react";
import { JsonRpcProvider } from "ethers";
import {
  type Certificate,
  downloadFileFromCID,
  getAllCertificates,
} from "@/lib/contracts-utils.ts";
import { ChevronUp, ClipboardCopy, MoveUpRight } from "lucide-react";

export const Route = createFileRoute("/certs/view")({
  component: RouteComponent,
});

function RouteComponent() {
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [wallets, setWallets] = useState<string[]>([]);

  const [certificates, setCertificates] = useState<Certificate[]>([]);

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
      setLoading(true);
      setCertificates(await getAllCertificates());
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets().then(() => {});
    loadCertificates().then(() => {});
  }, []);

  const filteredCertificates = useMemo(() => {
    if (!selectedWallet) return certificates;
    return certificates.filter(
      (certificate) =>
        certificate.owner.toString() === selectedWallet.toString(),
    );
  }, [certificates, selectedWallet]);

  return (
    <div className="px-4">
      <div className="flex justify-center items-center mb-4 gap-2">
        <label>Select a wallet: </label>
        <Select value={selectedWallet} onValueChange={setSelectedWallet}>
          <SelectTrigger className="">
            <SelectValue placeholder="---" />
          </SelectTrigger>
          <SelectContent>
            {wallets
              ? wallets.map((wallet) => (
                  <SelectItem key={wallet} value={wallet}>
                    {wallet}
                  </SelectItem>
                ))
              : null}
          </SelectContent>
        </Select>
      </div>
      {loading && filteredCertificates.length > 0 ? (
        <div className="flex justify-center items-center h-32">
          <h2>Loading...</h2>
        </div>
      ) : (
        <div className="grid lg:grid-cols-1 xl:grid-cols-2 auto-rows-72 gap-8 p-4">
          {filteredCertificates.map((cert, index) => (
            <div
              className={`${CARD} border-1 col-span-1 sm:col-span-1 lg:col-span-1 lg:row-span-1 space-y-4`}
              key={`cert-${index}-${cert.ipfsCID}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    cert.revoked
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {cert.revoked ? "Revoked" : "Valid"}
                </span>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                  Certificate Hash
                </label>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                    {cert.certificateHash}
                  </code>
                  <span
                    onClick={() =>
                      navigator.clipboard.writeText(cert.certificateHash)
                    }
                    className="inline-flex cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy hash"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigator.clipboard
                          .writeText(cert.certificateHash)
                          .then(() => {});
                      }
                    }}
                  >
                    <ClipboardCopy size={20} />
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                  Certificate File
                </label>
                <a
                  href={"#"}
                  onClick={async (e) => {
                    e.preventDefault();
                    await downloadFileFromCID(cert.ipfsCID).then(() => {});
                  }}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-[var(--color-chart-4)] hover:underline"
                >
                  Download Certificate
                  <span className="text-xs text-muted-foreground">
                    <MoveUpRight
                      size={12}
                      strokeWidth={1}
                      absoluteStrokeWidth
                    />
                  </span>
                </a>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <div>
                  <label className="text-xs text-muted-foreground">
                    Registered
                  </label>
                  <p className="text-sm">
                    {new Date(Number(cert.timestamp) * 1000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Owner</label>
                  <p className="text-sm font-mono">{cert.owner}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Domain</label>
                    <p className="text-sm font-mono">{cert.domain || 'N/A'}</p>
                </div>
              </div>
              <details className="group">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground list-none flex items-center gap-1">
                  <span className="transition-transform rotate-90 group-open:rotate-1260 duration-1500">
                    <ChevronUp size={20} strokeWidth={2} absoluteStrokeWidth />
                  </span>
                  Details
                </summary>
                <div className="mt-2 pl-4 space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Serial:</span>{" "}
                    <code className="text-xs">{cert.serialNumber}</code>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
