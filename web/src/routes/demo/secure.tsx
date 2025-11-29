import { createFileRoute } from "@tanstack/react-router";
import { Lock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/demo/secure")({
  component: SecurePage,
});

function SecurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header with Lock Icon */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <Lock className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-600">Secure Connection</h1>
          <p className="text-muted-foreground">
            This page has a valid certificate
          </p>
        </div>

        {/* Certificate Information Card */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Certificate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Issued To:</p>
                <p className="font-mono">secure.example.com</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Issued By:</p>
                <p className="font-mono">Nonce Sense CA</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Serial Number:</p>
                <p className="font-mono text-xs">0x1234...5678</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Valid Until:</p>
                <p className="font-mono">2025-12-31</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">IPFS CID:</p>
                <p className="font-mono text-xs">Qm...abc123</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Status:</p>
                <p className="text-green-600 font-semibold">✓ Valid</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                This certificate has been validated on the blockchain and matches the domain ownership records.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Note */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This is a demo page showing what a secure connection would look like
          </p>
        </div>
      </div>
    </div>
  );
}
