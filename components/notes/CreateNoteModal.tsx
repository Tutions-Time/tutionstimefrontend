"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CreateNoteModal({ open, setOpen, onCreate }: any) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    classLevel: "",
    board: "",
    price: "",
    keywords: "",
    pdf: null as File | null,
  });

  const update = (key: string, val: any) => setForm({ ...form, [key]: val });

  const submit = async () => {
    if (!form.title || !form.subject || !form.classLevel || !form.board || !form.price) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (!form.pdf) {
      toast({ title: "PDF file is required", variant: "destructive" });
      return;
    }

    if (form.pdf.size > 5 * 1024 * 1024) {
      toast({ title: "PDF size must be under 5MB", variant: "destructive" });
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "pdf" && v) fd.append("pdf", v);
      else fd.append(k, v as any);
    });

    setLoading(true);
    const success = await onCreate(fd);
    setLoading(false);

    if (success) {
      setOpen(false);
      setForm({
        title: "",
        subject: "",
        classLevel: "",
        board: "",
        price: "",
        keywords: "",
        pdf: null,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <Input placeholder="Title *" value={form.title} onChange={(e) => update("title", e.target.value)} />
          <Input placeholder="Subject *" value={form.subject} onChange={(e) => update("subject", e.target.value)} />
          <Input placeholder="Class *" value={form.classLevel} onChange={(e) => update("classLevel", e.target.value)} />
          <Input placeholder="Board *" value={form.board} onChange={(e) => update("board", e.target.value)} />
          <Input placeholder="Price *" value={form.price} onChange={(e) => update("price", e.target.value)} />
          <Input placeholder="Keywords (comma separated)" value={form.keywords} onChange={(e) => update("keywords", e.target.value)} />

          <input type="file" accept="application/pdf"
            onChange={(e) => update("pdf", e.target.files?.[0] || null)}
          />
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
