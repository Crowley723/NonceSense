import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  Lock,
  LockOpen,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { getAllCertificates } from "@/lib/contracts-utils";
import type { Certificate } from "@/lib/contracts-utils";

export const Route = createRootRoute({
  component: RootComponent,
});

type SecurityStatus = "secure" | "insecure" | "unknown" | "checking";

function RootComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isIndexRoute = location.pathname === "/";
  const [url, setUrl] = useState("");
  const [securityStatus, setSecurityStatus] =
    useState<SecurityStatus>("unknown");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [validCertificate, setValidCertificate] = useState<Certificate | null>(
    null,
  );
  const [domain, setDomain] = useState("");
  const [pendingCheck, setPendingCheck] = useState<string | null>(null);
  const [showCertDialog, setShowCertDialog] = useState(false);

  const performCertificateCheck = async (inputUrl: string) => {
    setSecurityStatus("checking");
    const status = await checkSecurity(inputUrl);
    setSecurityStatus(status);
  };

  // Load all certificates on component mount, but only on index route
  useEffect(() => {
    if (isIndexRoute) {
      loadCertificates().then(() => {});
    }
  }, [isIndexRoute]);

  // Handle pending certificate check after navigation and certificate loading
  useEffect(() => {
    if (isIndexRoute && pendingCheck && certificates.length > 0) {
      performCertificateCheck(pendingCheck);
      setPendingCheck(null);
    }
  }, [isIndexRoute, pendingCheck, certificates.length]);

  const loadCertificates = async () => {
    try {
      const allCerts = await getAllCertificates();
      setCertificates(allCerts);
    } catch (error) {
      console.error("Failed to load certificates:", error);
    }
  };

  const extractDomain = (inputUrl: string): string => {
    try {
      const urlWithProtocol = inputUrl.startsWith("http")
        ? inputUrl
        : `https://${inputUrl}`;
      const url = new URL(urlWithProtocol);
      return url.hostname;
    } catch {
      return inputUrl
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .split("/")[0];
    }
  };

  const checkSecurity = async (inputUrl: string): Promise<SecurityStatus> => {
    if (!inputUrl.trim()) return "unknown";

    const extractedDomain = extractDomain(inputUrl);
    setDomain(extractedDomain);

    const validCert = certificates.find(
      (cert) =>
        cert.domain.toLowerCase() === extractedDomain.toLowerCase() &&
        !cert.revoked,
    );

    setValidCertificate(validCert || null);
    return validCert ? "secure" : "insecure";
  };
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Reset security status when user is typing (no live checking)
    if (!newUrl.trim()) {
      setSecurityStatus("unknown");
      setDomain("");
      setValidCertificate(null);
    }
  };

  const handleSubmit = async (inputUrl: string) => {
    if (!inputUrl.trim()) return;

    if (!isIndexRoute) {
      setPendingCheck(inputUrl);
      await navigate({ to: "/" });
    } else {
      if (certificates.length > 0) {
        await performCertificateCheck(inputUrl);
      } else {
        setPendingCheck(inputUrl);
      }
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await handleSubmit(url);
    }
  };

  const getSecurityIcon = () => {
    switch (securityStatus) {
      case "secure":
        return <Lock className="h-5 w-5 text-green-600" />;
      case "insecure":
        return <LockOpen className="h-5 w-5 text-red-600" />;
      case "checking":
        return <Shield className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const SecureContent = () => (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Sample Content for {domain}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-lg">Welcome to our secure website!</p>
              <br />
              <p>
                We just finished setting up a blockchain-based tls certificate
                for our website! Please note the nice green lock icon in the URL
                bar!!!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const InsecureContent = () => (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="text-3xl flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h1>Warning: Potential Security Risk Ahead</h1>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-md text-red-800">
              We have detected a potential security threat and did not continue
              to <strong>{domain}</strong>. If you visit this site, attackers
              could try to steal information like your passwords, emails, or
              credit card details.
            </p>
            <p>
              <strong>What can you do about it?</strong>
              <p>
                The issue is most likely with the website, and there is nothing
                you can do to resolve it. You can notify the website's
                administrator about the problem.
              </p>
              <a
                className="text-blue-600 underline"
                href={
                  "https://support.mozilla.org/1/firefox/145.0/Linux/en-US/connection-not-secure"
                }
              >
                Learn more
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DefaultContent = () => (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold">Blockchain Based Certificates</h1>
          <h6 className="text-xs">
            Team Nonce Sense: Daniel A, Marcos P, Brynn C
          </h6>
        </div>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enter a domain name or URL in the address bar above to validate its
          blockchain certificate.
        </p>

        <Card className="max-w-2xl mx-auto">
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Secure Sites
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sites with valid blockchain certificates will show a green
                  lock in the URL bar.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Insecure Sites
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sites with an invalid blockchain certificate will show a red
                  unlock icon in the URL bar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="relative flex-1 min-w-80 max-w-2xl">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
                  <DialogTrigger asChild>
                    <button
                      className="hover:bg-gray-100 rounded p-1 -m-1 transition-colors flex items-center justify-center"
                      type="button"
                    >
                      {getSecurityIcon()}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getSecurityIcon()}
                        Certificate Information
                      </DialogTitle>
                      <DialogDescription>
                        {securityStatus === "secure" &&
                          "This connection is secure"}
                        {securityStatus === "insecure" &&
                          "This connection is not secure"}
                        {securityStatus === "unknown" &&
                          "No certificate information available"}
                        {securityStatus === "checking" &&
                          "Checking certificate..."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {securityStatus === "secure" && validCertificate && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Domain
                            </label>
                            <p className="text-sm font-mono break-all">
                              {validCertificate.domain}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Serial Number
                            </label>
                            <p className="text-sm font-mono break-all">
                              {validCertificate.serialNumber}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Owner
                            </label>
                            <p className="text-sm font-mono break-all">
                              {validCertificate.owner}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Issued
                            </label>
                            <p className="text-sm">
                              {new Date(
                                Number(validCertificate.timestamp) * 1000,
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              IPFS CID
                            </label>
                            <p className="text-sm font-mono break-all">
                              {validCertificate.ipfsCID}
                            </p>
                          </div>
                        </div>
                      )}

                      {securityStatus === "unknown" && (
                        <div className="text-center text-muted-foreground">
                          <p className="text-sm">
                            Enter a domain in the URL bar to check its
                            certificate status
                          </p>
                        </div>
                      )}

                      {securityStatus === "checking" && (
                        <div className="text-center text-muted-foreground">
                          <p className="text-sm">
                            Verifying certificate on blockchain...
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                type="text"
                placeholder="Enter URL to check certificate... (try 'secure.com' or 'insecure.com')"
                value={url}
                onChange={handleUrlChange}
                onKeyDown={handleKeyDown}
                className="text-base pl-12"
              />
            </div>
          </header>
          <main>
            {isIndexRoute && (
              <>
                {securityStatus === "secure" && <SecureContent />}
                {securityStatus === "insecure" && <InsecureContent />}
                {(securityStatus === "unknown" ||
                  securityStatus === "checking") && <DefaultContent />}
              </>
            )}
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/*<TanStackRouterDevtools />*/}
    </>
  );
}
