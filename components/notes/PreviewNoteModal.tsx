"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PreviewNoteModal({ open, setOpen, note }: any) {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>
        <iframe src={note.pdfUrl} className="w-full h-[70vh]" />
      </DialogContent>
    </Dialog>
  );
}
