"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export type DocumentType = "paystub" | "receipt";

interface DocumentImageViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title: string;
  documentType: DocumentType;
  documentId: string;
  viewHref: string;
  onEdit: () => void;
  onDelete: (documentId: string, deleteEntry: boolean) => Promise<void>;
  /** When false, View and Edit entry buttons are hidden (e.g. unlinked paystub/receipt) */
  hasLinkedEntry?: boolean;
}

const LABELS: Record<
  DocumentType,
  { document: string; entry: string; viewEntry: string }
> = {
  paystub: {
    document: "paystub",
    entry: "income",
    viewEntry: "View income entry",
  },
  receipt: {
    document: "receipt",
    entry: "expense",
    viewEntry: "View expense entry",
  },
};

export function DocumentImageViewDialog({
  open,
  onOpenChange,
  imageUrl,
  title,
  documentType,
  documentId,
  viewHref,
  onEdit,
  onDelete,
  hasLinkedEntry = true,
}: DocumentImageViewDialogProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const labels = LABELS[documentType];

  const handleDeleteClick = () => {
    onOpenChange(false);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async (deleteEntry: boolean) => {
    setDeleting(true);
    try {
      await onDelete(documentId, deleteEntry);
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmClose = (open: boolean) => {
    if (!open) setDeleteConfirmOpen(false);
  };

  if (!open && !deleteConfirmOpen) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-auto min-h-[400px] bg-muted rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <DialogFooter className="flex flex-wrap gap-2 sm:justify-end">
            {hasLinkedEntry && (
              <>
                <Button variant="outline" asChild>
                  <Link href={viewHref}>{labels.viewEntry}</Link>
                </Button>
                <Button variant="outline" onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit {labels.entry} entry
                </Button>
              </>
            )}
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={handleConfirmClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {labels.document}?</DialogTitle>
            <DialogDescription>
              {hasLinkedEntry
                ? `Do you also want to delete the associated ${labels.entry} entry?`
                : `This will remove the ${labels.document} image.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => handleConfirmClose(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            {hasLinkedEntry ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => handleDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Delete {labels.document} only
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteConfirm(true)}
                  disabled={deleting}
                >
                  Delete {labels.document} and associated entry
                </Button>
              </>
            ) : (
              <Button
                variant="destructive"
                onClick={() => handleDeleteConfirm(false)}
                disabled={deleting}
              >
                Delete {labels.document}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
