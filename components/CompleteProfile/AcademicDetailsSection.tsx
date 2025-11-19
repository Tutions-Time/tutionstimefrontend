"use client";

import { GraduationCap } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField, setBulk } from "@/store/slices/studentProfileSlice";
import OtherInline from "@/components/forms/OtherInline";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ---------------------- Constants ---------------------- */
const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "Cambridge", "Other"] as const;
const CLASSES = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12",
] as const;
const STREAMS = ["Science", "Commerce", "Humanities", "Other"] as const;
const PROGRAMS = ["Undergraduate", "Postgraduate", "Diploma", "Other"] as const;
const DISCIPLINES = [
  "Engineering/Tech", "Science", "Arts", "Commerce/Management", "Law", "Medicine", "Other",
] as const;
const YEAR_SEM = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
const EXAMS = [
  "JEE Main", "JEE Advanced", "NEET", "CUET", "UPSC", "SSC", "Banking", "CAT", "GATE", "Other",
] as const;
const toOptions = (arr: readonly string[]) => arr.map(v => ({ value: v, label: v }));

/* ---------------------- Component ---------------------- */
export default function AcademicDetailsSection({
  errors,
  disabled = false,
}: {
  errors: Record<string, string>;
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const onTrackChange = (val: "school" | "college" | "competitive" | "") => {
    if (disabled) return; // prevent interaction
    const resets: any = {
      board: "", boardOther: "", classLevel: "", classLevelOther: "", stream: "", streamOther: "",
      program: "", programOther: "", discipline: "", disciplineOther: "", yearSem: "", yearSemOther: "",
      exam: "", examOther: "", targetYear: "", targetYearOther: "", subjects: [], subjectOther: "",
    };
    dispatch(setBulk({ track: val, ...resets }));
  };

  const onOtherChange =
    (baseKey: string, otherKey: string, options: readonly string[]) =>
    (val: string) => {
      if (disabled) return;
      const isKnown = options.includes(val as any) || val === "";
      if (isKnown) {
        dispatch(setField({ key: baseKey as any, value: val }));
        if (val !== "Other") dispatch(setField({ key: otherKey as any, value: "" }));
      } else {
        dispatch(setField({ key: baseKey as any, value: "Other" }));
        dispatch(setField({ key: otherKey as any, value: val }));
      }
    };

  return (
    <section
      className={cn(
        "bg-white/90 rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur p-8 transition",
        disabled && "opacity-80 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Academic Details</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Learning Track */}
        <div className="md:col-span-3">
          <Label>Learning Track</Label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { key: "school", label: "School" },
              { key: "college", label: "College" },
              { key: "competitive", label: "Competitive Exams" },
            ].map((t) => {
              const active = profile.track === (t.key as any);
              return (
                <label
                  key={t.key}
                  className={cn(
                    "flex items-center justify-center text-sm font-medium rounded-xl border px-3 py-2 transition-all select-none",
                    active
                      ? "bg-primary/10 border-primary/40 ring-2 ring-primary/30 text-primary"
                      : "hover:bg-gray-50 border-gray-200",
                    disabled && "cursor-not-allowed opacity-70"
                  )}
                >
                  <input
                    type="radio"
                    name="track"
                    className="hidden"
                    checked={active}
                    onChange={() => onTrackChange(t.key as any)}
                    disabled={disabled}
                  />
                  {t.label}
                </label>
              );
            })}
          </div>
          {errors.track && (
            <p className="text-rose-600 text-xs mt-1">{errors.track}</p>
          )}
        </div>

        {/* SCHOOL */}
        {profile.track === "school" && (
          <>
            <OtherInline
              label="Education Board"
              value={profile.boardOther || profile.board}
              options={toOptions(BOARDS)}
              onChange={onOtherChange("board", "boardOther", BOARDS)}
              disabled={disabled}
            />
            <OtherInline
              label="Class"
              value={profile.classLevelOther || profile.classLevel}
              options={toOptions(CLASSES)}
              onChange={onOtherChange("classLevel", "classLevelOther", CLASSES)}
              disabled={disabled}
            />
            {["Class 11", "Class 12"].includes(profile.classLevel) && (
              <OtherInline
                label="Stream (for Class 11–12)"
                value={profile.streamOther || profile.stream}
                options={toOptions(STREAMS)}
                onChange={onOtherChange("stream", "streamOther", STREAMS)}
                disabled={disabled}
              />
            )}
          </>
        )}

        {/* COLLEGE */}
        {profile.track === "college" && (
          <>
            <OtherInline
              label="Program"
              value={profile.programOther || profile.program}
              options={toOptions(PROGRAMS)}
              onChange={onOtherChange("program", "programOther", PROGRAMS)}
              disabled={disabled}
            />
            <OtherInline
              label="Discipline"
              value={profile.disciplineOther || profile.discipline}
              options={toOptions(DISCIPLINES)}
              onChange={onOtherChange("discipline", "disciplineOther", DISCIPLINES)}
              disabled={disabled}
            />
            <OtherInline
              label="Year / Semester"
              value={profile.yearSemOther || profile.yearSem}
              options={toOptions(YEAR_SEM)}
              onChange={onOtherChange("yearSem", "yearSemOther", YEAR_SEM)}
              disabled={disabled}
            />
          </>
        )}

        {/* COMPETITIVE */}
        {profile.track === "competitive" && (
          <>
            <OtherInline
              label="Exam"
              value={profile.examOther || profile.exam}
              options={toOptions(EXAMS)}
              onChange={onOtherChange("exam", "examOther", EXAMS)}
              disabled={disabled}
            />
          </>
        )}
      </div>
    </section>
  );
}
