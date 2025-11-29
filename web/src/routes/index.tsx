import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, LockOpen, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

type SecurityStatus = "secure" | "insecure" | "unknown";

function RouteComponent() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>("unknown");

  const checkSecurity = (inputUrl: string): SecurityStatus => {
    const lower = inputUrl.toLowerCase();
    if (lower.includes("secure") || lower.includes("/demo/secure")) {
      return "secure";
    } else if (lower.includes("insecure") || lower.includes("/demo/insecure")) {
      return "insecure";
    }
    return "unknown";
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setSecurityStatus(checkSecurity(newUrl));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && url) {
      // Navigate to demo pages if they match
      if (url.includes("/demo/secure") || url.toLowerCase() === "secure") {
        navigate({ to: "/demo/secure" as any });
      } else if (url.includes("/demo/insecure") || url.toLowerCase() === "insecure") {
        navigate({ to: "/demo/insecure" as any });
      }
    }
  };

  const getSecurityIcon = () => {
    switch (securityStatus) {
      case "secure":
        return <Lock className="h-5 w-5 text-green-600" />;
      case "insecure":
        return <LockOpen className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Nonce Sense</h1>
          <p className="text-lg text-muted-foreground">
            Decentralized Certificate Validation
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            A proof-of-concept blockchain-based PKI system that replaces centralized
            Certificate Authorities with transparent, on-chain certificate validation.
          </p>
        </div>

        {/* Browser-like Search Bar */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {getSecurityIcon()}
            </div>
            <Input
              type="text"
              placeholder="Enter URL to check certificate... (try 'secure' or 'insecure')"
              value={url}
              onChange={handleUrlChange}
              onKeyDown={handleKeyDown}
              className="text-base"
            />
          </div>
        </Card>

        {/* Demo Instructions */}
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Try these demo pages:
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate({ to: "/demo/secure" as any })}
              className="text-sm text-green-600 hover:underline flex items-center gap-1"
            >
              <Lock className="h-4 w-4" />
              /demo/secure
            </button>
            <button
              onClick={() => navigate({ to: "/demo/insecure" as any })}
              className="text-sm text-red-600 hover:underline flex items-center gap-1"
            >
              <LockOpen className="h-4 w-4" />
              /demo/insecure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
