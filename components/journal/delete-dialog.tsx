"use client";

import { useState } from "react";
import { deleteTrade } from "@/actions/trade-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradeId: number | null;
  onSuccess?: () => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  tradeId,
  onSuccess,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tradeId) return;
    setIsDeleting(true);
    try {
      const result = await deleteTrade(tradeId);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to delete trade");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Trade</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this trade? This action cannot be
            undone. All subsequent trade balances will be recalculated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
