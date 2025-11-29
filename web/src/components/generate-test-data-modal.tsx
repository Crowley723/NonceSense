import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useState } from "react";

interface GenerateTestDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function GenerateTestDataModal({
  isOpen,
  onClose,
  onConfirm,
}: GenerateTestDataModalProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Test Data?</DialogTitle>
          <DialogDescription>
            This will create 20 certificates and revoke 5 random ones.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={loading} variant="destructive" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setLoading(true);
              await onConfirm();
              setLoading(false);
            }}
            disabled={loading}
          >
            {loading ? <Spinner /> : null}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
