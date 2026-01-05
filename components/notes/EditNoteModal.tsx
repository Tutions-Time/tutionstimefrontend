"use client";

import { getUserProfile } from "@/services/profileService";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
 

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  note: any | null;
  onSave: (id: string, fd: FormData) => Promise<boolean>;
};

export default function EditNoteModal({ open, setOpen, note, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [board, setBoard] = useState("");
  const [price, setPrice] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [options, setOptions] = useState<{
    subjects: string[];
    classLevels: string[];
    boards: string[];
  }>({ subjects: [], classLevels: [], boards: [] });

  // Prefill form when note changes
  useEffect(() => {
    if (!note) return;
    setTitle(note.title || "");
    setSubject(note.subject || "");
    setClassLevel(note.classLevel || "");
    setBoard(note.board || "");
    setPrice(note.price != null ? String(note.price) : "");
    setPdfFile(null);
  }, [note]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!open) return;
      try {
        const res = await getUserProfile();
        const profile = res?.data?.profile;
        const subjects = Array.isArray(profile?.subjects) ? profile.subjects : [];
        const classLevels = Array.isArray(profile?.classLevels)
          ? profile.classLevels
          : [];
        const boards = Array.isArray(profile?.boards) ? profile.boards : [];
        const merge = (arr: string[], val: string) => {
          const set = new Set(arr);
          if (val) set.add(val);
          return Array.from(set);
        };
        setOptions({
          subjects: merge(subjects, note?.subject || ""),
          classLevels: merge(classLevels, note?.classLevel || ""),
          boards: merge(boards, note?.board || ""),
        });
      } catch {
        toast({ title: "Unable to load profile options", variant: "destructive" });
      }
    };
    loadProfile();
  }, [open, note]);

  if (!note) return null;

  const handleSubmit = async () => {
    if (!title || !subject || !classLevel || !board || !price) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      toast({ title: "Price must be a valid number", variant: "destructive" });
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("subject", subject);
    fd.append("classLevel", classLevel);
    fd.append("board", board);
    fd.append("price", price);

    // Only send new PDF if user selected one
    if (pdfFile) {
      if (pdfFile.size > 150 * 1024 * 1024) {
        toast({ title: "PDF size must be under 150MB", variant: "destructive" });
        return;
      }
      fd.append("pdf", pdfFile);
    }

    setLoading(true);
    const ok = await onSave(note._id, fd);
    setLoading(false);

    if (ok) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Input
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="w-full border rounded-lg h-10 px-3 bg-background"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
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
            value={board}
            onChange={(e) => setBoard(e.target.value)}
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <div className="text-xs text-muted-foreground">
            Current PDF is already attached. Upload a new file only if you want to replace it.
          </div>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
