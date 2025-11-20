"use client";

import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";
import { BookOpen, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ---------------------- Option Sets ---------------------- */
const SUBJECTS: Record<string, string[]> = {
  School: [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Social Studies",
    "Hindi",
    "Computer Science",
    "Other",
  ],
  College: [
    "Economics",
    "Accountancy",
    "Engineering Physics",
    "Programming",
    "Microbiology",
    "Political Science",
    "Other",
  ],
  "Working Professional": [
    "Communication Skills",
    "Business English",
    "Aptitude",
    "Soft Skills",
    "Interview Preparation",
    "Other",
  ],
};

const CLASS_LEVELS: Record<string, string[]> = {
  School: [
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ],
  College: ["Undergraduate", "Postgraduate"],
  "Working Professional": ["Corporate Training", "Skill Enhancement"],
};

const BOARDS: Record<string, string[]> = {
  School: ["CBSE", "ICSE", "State Board", "IB", "Cambridge", "Other"],
  College: ["University", "Autonomous College", "Other"],
  "Working Professional": ["N/A", "Other"],
};

const STUDENT_TYPES = ["School", "College", "Working Professional"];
const GROUP_SIZES = ["One-to-One", "Small Batch (2–5)", "Large Batch (6+)"];

export default function TutorSubjectsSection({
  disabled = false, // ✅ new prop
}: {
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  const [otherSubject, setOtherSubject] = useState("");
  const [otherBoard, setOtherBoard] = useState("");

  const selectedTypes = profile.studentTypes || [];

  /* ---------------------- Derived Options ---------------------- */
  const subjectOptions = useMemo(() => {
    if (!selectedTypes.length) return [];
    const merged = Array.from(
      new Set(selectedTypes.flatMap((t) => SUBJECTS[t] || []))
    );
    return merged.sort((a, b) => (a === "Other" ? 1 : b === "Other" ? -1 : 0));
  }, [selectedTypes]);

  const classOptions = useMemo(() => {
    if (!selectedTypes.length) return [];
    return Array.from(
      new Set(selectedTypes.flatMap((t) => CLASS_LEVELS[t] || []))
    );
  }, [selectedTypes]);

  const boardOptions = useMemo(() => {
    if (!selectedTypes.length) return [];
    const merged = Array.from(
      new Set(selectedTypes.flatMap((t) => BOARDS[t] || []))
    );
    return merged.sort((a, b) => (a === "Other" ? 1 : b === "Other" ? -1 : 0));
  }, [selectedTypes]);

type ArrayKeys =
  | "subjects"
  | "classLevels"
  | "boards"
  | "exams"
  | "studentTypes";

const toggleArrayField = (key: ArrayKeys, value: string) => {
  if (disabled) return;

  const arr = Array.isArray(profile[key]) ? [...profile[key]] : [];
  const exists = arr.includes(value);
  const next = exists ? arr.filter((v) => v !== value) : [...arr, value];

  if ((key === "subjects" || key === "boards") && !next.includes("Other")) {
    const computedKey = `${key}Other` as keyof typeof profile;
    dispatch(setField({ key: computedKey, value: "" }));
  }

  dispatch(setField({ key, value: next }));
};

  const addCustomValue = (
    field: "subjects" | "boards",
    input: string,
    setInput: (v: string) => void
  ) => {
    if (disabled) return;

    const trimmed = input.trim();
    if (!trimmed) return;
    const formatted =
      trimmed
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

    const current = Array.isArray(profile[field]) ? profile[field] : [];
    if (!current.includes(formatted)) {
      const updated = [
        ...current.filter((s) => s !== "Other"),
        formatted,
        "Other",
      ];
      dispatch(setField({ key: field, value: updated }));
    }

    setInput("");
  };

  const handleOtherKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "subjects" | "boards",
    input: string,
    setInput: (v: string) => void
  ) => {
    if (disabled) return;
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomValue(field, input, setInput);
    }
  };

  const handleOtherBlur = (
    field: "subjects" | "boards",
    input: string,
    setInput: (v: string) => void
  ) => {
    if (disabled) return;
    addCustomValue(field, input, setInput);
  };

  const chipClasses = (active: boolean) =>
    cn(
      "flex items-center justify-center text-sm rounded-xl border px-3 py-2 cursor-pointer select-none transition-all",
      active
        ? "bg-primary/10 border-primary/40 ring-2 ring-primary/30 text-primary font-medium"
        : "hover:bg-gray-50 border-gray-200 text-gray-700",
      disabled && "opacity-60 pointer-events-none cursor-not-allowed"
    );

  /* ---------------------- Render ---------------------- */
  return (
    <section
      className={`bg-white rounded-2xl shadow p-8 transition ${
        disabled ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <BookOpen className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Subjects & Classes
        </h2>
      </div>

      {/* Student Type */}
      <div className="mb-8">
        <Label className="block mb-2 font-medium">Preferred Student Type</Label>
        <div className="flex flex-wrap gap-2">
          {STUDENT_TYPES.map((type) => {
            const active = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleArrayField("studentTypes", type)}
                className={chipClasses(active)}
                disabled={disabled}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {selectedTypes.length > 0 && (
        <>
          {/* Subjects */}
          <div className="mb-8">
            <Label className="block mb-2 font-medium">Subjects You Teach</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {subjectOptions.map((s) => {
                const active = profile.subjects.includes(s);
                return (
                  <label key={s} className={chipClasses(active)}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={active}
                      onChange={() => toggleArrayField("subjects", s)}
                      disabled={disabled}
                    />
                    {s}
                  </label>
                );
              })}
            </div>

            {profile.subjects.includes("Other") && (
              <div className="mt-4 max-w-md relative">
                <Label className="mb-1 block">Other Subject</Label>
                <div className="relative">
                  <Input
                    disabled={disabled}
                    value={otherSubject}
                    onChange={(e) => setOtherSubject(e.target.value)}
                    onKeyDown={(e) =>
                      handleOtherKeyDown(e, "subjects", otherSubject, setOtherSubject)
                    }
                    onBlur={() =>
                      handleOtherBlur("subjects", otherSubject, setOtherSubject)
                    }
                    placeholder="Type subject and press Enter"
                    className="h-10 pr-10"
                  />
                  {!disabled && otherSubject.trim() && (
                    <button
                      type="button"
                      onClick={() =>
                        addCustomValue("subjects", otherSubject, setOtherSubject)
                      }
                      className="absolute inset-y-0 right-2 flex items-center justify-center text-primary hover:text-primary/80 transition"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Classes */}
          <div className="mb-8">
            <Label className="block mb-2 font-medium">Classes You Teach</Label>
            <div className="flex flex-wrap gap-2">
              {classOptions.map((opt) => {
                const selected = profile.classLevels.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleArrayField("classLevels", opt)}
                    className={chipClasses(selected)}
                    disabled={disabled}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Boards */}
          <div className="mb-8">
            <Label className="block mb-2 font-medium">Boards / Curriculums</Label>
            <div className="flex flex-wrap gap-2">
              {boardOptions.map((b) => {
                const active = profile.boards.includes(b);
                return (
                  <label key={b} className={chipClasses(active)}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={active}
                      onChange={() => toggleArrayField("boards", b)}
                      disabled={disabled}
                    />
                    {b}
                  </label>
                );
              })}
            </div>

            {profile.boards.includes("Other") && (
              <div className="mt-4 max-w-md relative">
                <Label className="mb-1 block">Other Board / Curriculum</Label>
                <div className="relative">
                  <Input
                    disabled={disabled}
                    value={otherBoard}
                    onChange={(e) => setOtherBoard(e.target.value)}
                    onKeyDown={(e) =>
                      handleOtherKeyDown(e, "boards", otherBoard, setOtherBoard)
                    }
                    onBlur={() =>
                      handleOtherBlur("boards", otherBoard, setOtherBoard)
                    }
                    placeholder="Type board and press Enter"
                    className="h-10 pr-10"
                  />
                  {!disabled && otherBoard.trim() && (
                    <button
                      type="button"
                      onClick={() =>
                        addCustomValue("boards", otherBoard, setOtherBoard)
                      }
                      className="absolute inset-y-0 right-2 flex items-center justify-center text-primary hover:text-primary/80 transition"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Group Size */}
          <div>
            <Label className="block mb-2 font-medium">
              Group Size Preference
            </Label>
            <div className="flex flex-wrap gap-2">
              {GROUP_SIZES.map((size) => {
                const active = profile.groupSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      !disabled &&
                      dispatch(setField({ key: "groupSize", value: size }))
                    }
                    className={chipClasses(active)}
                    disabled={disabled}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
