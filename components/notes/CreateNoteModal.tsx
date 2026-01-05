"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getUserProfile } from "@/services/profileService";
import { useEffect, useState } from "react";

export default function CreateNoteModal({ open, setOpen, onCreate }: any) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{
    subjects: string[];
    classLevels: string[];
    boards: string[];
  }>({ subjects: [], classLevels: [], boards: [] });

  const [form, setForm] = useState({
    title: "",
    subject: "",
    classLevel: "",
    board: "",
    price: "",
    pdf: null as File | null,
  });

  const update = (key: string, val: any) => setForm({ ...form, [key]: val });

  useEffect(() => {
    const loadProfile = async () => {
      if (!open) return;
      try {
        const res = await getUserProfile();
        const profile = res?.data?.profile;
        setOptions({
          subjects: Array.isArray(profile?.subjects) ? profile.subjects : [],
          classLevels: Array.isArray(profile?.classLevels)
            ? profile.classLevels
            : [],
          boards: Array.isArray(profile?.boards) ? profile.boards : [],
        });
      } catch {
        toast({
          title: "Unable to load profile options",
          variant: "destructive",
        });
      }
    };
    loadProfile();
  }, [open]);

  const submit = async () => {
    if (!form.title || !form.subject || !form.classLevel || !form.board || !form.price) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const numericPrice = Number(form.price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      toast({ title: "Price must be a valid number", variant: "destructive" });
      return;
    }

    if (!form.pdf) {
      toast({ title: "PDF file is required", variant: "destructive" });
      return;
    }

    if (form.pdf.size > 150 * 1024 * 1024) {
      toast({ title: "PDF size must be under 150MB", variant: "destructive" });
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
          <select
            className="w-full border rounded-lg h-10 px-3 bg-background"
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            disabled={options.subjects.length === 0}
          >
            <option value="">Select Subject *</option>
            {options.subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="w-full border rounded-lg h-10 px-3 bg-background"
            value={form.classLevel}
            onChange={(e) => update("classLevel", e.target.value)}
            disabled={options.classLevels.length === 0}
          >
            <option value="">Select Class *</option>
            {options.classLevels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="w-full border rounded-lg h-10 px-3 bg-background"
            value={form.board}
            onChange={(e) => update("board", e.target.value)}
            disabled={options.boards.length === 0}
          >
            <option value="">Select Board *</option>
            {options.boards.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="Price *"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />

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
