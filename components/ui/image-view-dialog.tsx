"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface ImageViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
}

export function ImageViewDialog({
  open,
  onOpenChange,
  imageUrl,
  title = "View Image",
}: ImageViewDialogProps) {
  return (
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
      </DialogContent>
    </Dialog>
  );
}
