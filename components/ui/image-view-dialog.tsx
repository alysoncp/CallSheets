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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'image-view-dialog.tsx:24',message:'ImageViewDialog render',data:{open,imageUrl,imageUrlLength:imageUrl?.length,imageUrlIsEmpty:imageUrl==='',imageUrlIsNull:imageUrl===null,title},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // #region agent log
  if (open && (!imageUrl || imageUrl === '')) {
    fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'image-view-dialog.tsx:28',message:'ImageViewDialog open with empty imageUrl',data:{open,imageUrl,imageUrlType:typeof imageUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  }
  // #endregion

  if (!open || !imageUrl || imageUrl === '') {
    return null;
  }

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
