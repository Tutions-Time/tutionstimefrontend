"use client";

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
import { useState, useEffect } from "react";

// ✅ IMPORTANT: we now use THIS API (same as TutorProfilePage)
import { getUserProfile } from "@/services/profileService";

export default function CreateNoteModal({ open, setOpen, onCreate }: any) {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Dropdown options
  const [boards, setBoards] = useState<string[]>([]);
  const [classLevels, setClassLevels] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [studentTypes, setStudentTypes] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    classLevel: "",
    board: "",
    price: "",
    keywords: "",
    studentType: "",
    pdf: null as File | null,
  });

  const update = (key: string, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // -------------------------------------------------------
  // ✅ Load Tutor Profile using the SAME API as your profile screen
  // -------------------------------------------------------
  useEffect(() => {
    if (!open) return;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const res = await getUserProfile();

        console.log("PROFILE RESPONSE (modal): ", res);

        if (res.success && res.data?.profile) {
          const p = res.data.profile;

          setBoards(p.boards || []);
          setClassLevels(p.classLevels || []);
          setSubjects(p.subjects || []);
          setStudentTypes(p.studentTypes || []);
        } else {
          toast({
            title: "Could not load tutor profile",
            description:
              "Boards, classes, subjects, and student types missing.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("profile load error", err);
        toast({
          title: "Error loading tutor profile",
          variant: "destructive",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [open]);

  // -------------------------------------------------------
  // SUBMIT
  // -------------------------------------------------------
  const submit = async () => {
    if (
      !form.title ||
      !form.subject ||
      !form.classLevel ||
      !form.board ||
      !form.price ||
      !form.studentType
    ) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!form.pdf) {
      toast({
        title: "PDF file is required",
        variant: "destructive",
      });
      return;
    }

    if (form.pdf.size > 5 * 1024 * 1024) {
      toast({
        title: "PDF must be under 5MB",
        variant: "destructive",
      });
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
        studentType: "",
        pdf: null,
      });
    }
  };

  const isDisabled = profileLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">

          {/* TITLE */}
          <Input
            placeholder="Title *"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />

          {/* SUBJECT */}
          <select
            className="border rounded-md p-2 bg-white"
            value={form.subject}
            disabled={isDisabled}
            onChange={(e) => update("subject", e.target.value)}
          >
            <option value="">
              {profileLoading ? "Loading Subjects..." : "Select Subject *"}
            </option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* CLASS */}
          <select
            className="border rounded-md p-2 bg-white"
            value={form.classLevel}
            disabled={isDisabled}
            onChange={(e) => update("classLevel", e.target.value)}
          >
            <option value="">
              {profileLoading ? "Loading Classes..." : "Select Class *"}
            </option>
            {classLevels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* BOARD */}
          <select
            className="border rounded-md p-2 bg-white"
            value={form.board}
            disabled={isDisabled}
            onChange={(e) => update("board", e.target.value)}
          >
            <option value="">
              {profileLoading ? "Loading Boards..." : "Select Board *"}
            </option>
            {boards.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* STUDENT TYPE */}
          <select
            className="border rounded-md p-2 bg-white"
            value={form.studentType}
            disabled={isDisabled}
            onChange={(e) => update("studentType", e.target.value)}
          >
            <option value="">
              {profileLoading
                ? "Loading Student Types..."
                : "Select Student Type *"}
            </option>
            {studentTypes.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* PRICE */}
          <Input
            placeholder="Price *"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />

          {/* KEYWORDS */}
          <Input
            placeholder="Keywords (comma separated)"
            value={form.keywords}
            onChange={(e) => update("keywords", e.target.value)}
          />

          {/* FILE */}
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => update("pdf", e.target.files?.[0] || null)}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={submit}
            disabled={loading || profileLoading}
            className="bg-primary text-white"
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
