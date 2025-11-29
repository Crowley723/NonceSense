import { createFileRoute } from "@tanstack/react-router";
import { LockOpen, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/demo/insecure")({
  component: InsecurePage,
});

function InsecurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header with Warning Icon */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <LockOpen className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-600">Insecure Connection</h1>
          <p className="text-muted-foreground">
            This page does not have a valid certificate
          </p>
        </div>

        {/* Warning Card */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Security Warning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">No Valid Certificate Found</p>
                  <p className="text-sm text-muted-foreground">
                    This domain does not have a certificate registered on the blockchain
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Cannot Verify Ownership</p>
                  <p className="text-sm text-muted-foreground">
                    Unable to confirm the identity of this website
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Data May Not Be Encrypted</p>
                  <p className="text-sm text-muted-foreground">
                    Your connection to this site may not be secure
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-red-200">
              <p className="text-xs text-red-700 font-semibold">
                ⚠ Proceed with caution. Do not enter sensitive information on this site.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Domain Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Domain Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Domain:</p>
                <p className="font-mono">insecure.example.com</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Certificate Status:</p>
                <p className="text-red-600 font-semibold">✗ Not Found</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Note */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This is a demo page showing what an insecure connection would look like
          </p>
        </div>
      </div>
    </div>
  );
}
