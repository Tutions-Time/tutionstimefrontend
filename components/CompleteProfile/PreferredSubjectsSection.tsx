"use client";

import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/studentProfileSlice";
import { BookOpen, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUBJECTS_SCHOOL_GENERIC = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Sanskrit",
  "History",
  "Geography",
  "Civics",
  "Economics",
  "Computer Science",
  "Accountancy",
  "Other",
] as const;

const SUBJECTS_COLLEGE_BY_DISCIPLINE: Record<string, string[]> = {
  "Engineering/Tech": ["DSA", "DBMS", "OS", "Networks", "Maths", "Other"],
  Science: ["Physics", "Chemistry", "Biology", "Mathematics", "Statistics", "Other"],
  Arts: ["History", "Political Science", "Sociology", "Psychology", "Other"],
  "Commerce/Management": ["Accounting", "Economics", "Finance", "Marketing", "Other"],
  Law: ["Constitution", "Criminal Law", "Contract", "Jurisprudence", "Other"],
  Medicine: ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Other"],
  Other: ["Other"],
};

const SUBJECTS_COMP_BY_EXAM: Record<string, string[]> = {
  "JEE Main": ["Maths", "Physics", "Chemistry", "Other"],
  "JEE Advanced": ["Maths", "Physics", "Chemistry", "Other"],
  NEET: ["Physics", "Chemistry", "Biology", "Other"],
  CUET: ["Domain Subjects", "General Test", "Language", "Other"],
  UPSC: ["GS", "CSAT", "Optional", "Essay", "Other"],
  SSC: ["Quant", "Reasoning", "English", "GA", "Other"],
  Banking: ["Quant", "Reasoning", "English", "GA", "Other"],
  CAT: ["QA", "DILR", "VARC", "Other"],
  GATE: ["Core Subject", "Engineering Maths", "Aptitude", "Other"],
  Other: ["Other"],
};

export default function PreferredSubjectsSection({
  errors,
}: {
  errors: Record<string, string>;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);
  const [otherInput, setOtherInput] = useState("");

  const subjectOptions = useMemo(() => {
    if (profile.track === "school") return [...SUBJECTS_SCHOOL_GENERIC];
    if (profile.track === "college") {
      return SUBJECTS_COLLEGE_BY_DISCIPLINE[profile.discipline || "Other"];
    }
    if (profile.track === "competitive") {
      return SUBJECTS_COMP_BY_EXAM[profile.exam || "Other"];
    }
    return [];
  }, [profile.track, profile.discipline, profile.exam]);

  const toggleSubject = (subj: string) => {
    const exists = profile.subjects.includes(subj);
    const next = exists
      ? profile.subjects.filter((s) => s !== subj)
      : [...profile.subjects, subj];
    if (!next.includes("Other")) {
      dispatch(setField({ key: "subjectOther", value: "" }));
    }
    dispatch(setField({ key: "subjects", value: next }));
  };

  const addCustomSubject = () => {
    const trimmed = otherInput.trim();
    if (!trimmed) return;
    const formatted = trimmed
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    if (!profile.subjects.includes(formatted)) {
      const updated = [...profile.subjects.filter((s) => s !== "Other"), formatted, "Other"];
      dispatch(setField({ key: "subjects", value: updated }));
    }

    setOtherInput("");
  };

  const handleOtherKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSubject();
    }
  };

  const handleOtherBlur = () => {
    addCustomSubject();
  };

  return (
    <div className="bg-white/90 rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <BookOpen className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Preferred Subjects</h2>
      </div>

      {profile.track ? (
        <>
          {/* Subject Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subjectOptions.map((s) => {
              const active = profile.subjects.includes(s);
              return (
                <label
                  key={s}
                  className={cn(
                    "flex items-center justify-center text-sm rounded-xl border px-3 py-2 cursor-pointer transition-all select-none",
                    active
                      ? "bg-primary/10 border-primary/40 ring-2 ring-primary/30 text-primary font-medium"
                      : "hover:bg-gray-50 border-gray-200"
                  )}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={active}
                    onChange={() => toggleSubject(s)}
                  />
                  {s}
                </label>
              );
            })}

            {/* Dynamically Added Custom Subjects */}
            {profile.subjects
              .filter((s) => !subjectOptions.includes(s) && s !== "Other")
              .map((custom) => (
                <label
                  key={custom}
                  className="flex items-center justify-center text-sm rounded-xl border px-3 py-2 cursor-pointer transition-all select-none bg-primary/10 border-primary/40 ring-2 ring-primary/30 text-primary font-medium"
                >
                  {custom}
                </label>
              ))}
          </div>

          {/* "Other" Input Field */}
          {profile.subjects.includes("Other") && (
            <div className="mt-4 max-w-md relative">
              <Label className="mb-1 block">Other Subject</Label>
              <div className="relative">
                <Input
                  value={otherInput}
                  onChange={(e) => setOtherInput(e.target.value)}
                  onKeyDown={handleOtherKeyDown}
                  onBlur={handleOtherBlur}
                  placeholder="Type subject and press Enter"
                  className="h-10 pr-10"
                />
                {otherInput.trim() && (
                  <button
                    type="button"
                    onClick={addCustomSubject}
                    className="absolute inset-y-0 right-2 flex items-center justify-center text-primary hover:text-primary/80 transition"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {errors.subjects && (
            <p className="text-rose-600 text-xs mt-2">{errors.subjects}</p>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-600">
          Select your learning track above to see relevant subjects.
        </p>
      )}
    </div>
  );
}
