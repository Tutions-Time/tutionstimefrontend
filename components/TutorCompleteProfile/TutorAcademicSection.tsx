"use client";
import { GraduationCap } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";
import OtherInline from "@/components/forms/OtherInline";

const QUALIFICATIONS = [
  "B.Sc",
  "M.Sc",
  "B.Tech",
  "M.Tech",
  "B.A",
  "M.A",
  "B.Ed",
  "M.Ed",
  "Ph.D",
  "Other",
];
const SPECIALIZATIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "Economics",
  "Accountancy",
  "History",
  "Other",
];

// ✅ Generate experience options dynamically
const EXPERIENCE_OPTIONS = Array.from({ length: 51 }, (_, i) => ({
  value: i.toString(),
  label: i === 0 ? "Less than 1 year" : `${i} year${i > 1 ? "s" : ""}`,
}));

const toOptions = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

export default function TutorAcademicSection({
  disabled = false, // ✅ new prop
}: {
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  return (
    <section
      className={`bg-white rounded-2xl shadow p-8 transition ${
        disabled ? "opacity-80 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="text-primary w-5 h-5" />
        <h2 className="text-xl font-semibold">Academic & Teaching</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <OtherInline
          label="Highest Qualification"
          value={profile.qualification}
          options={toOptions(QUALIFICATIONS)}
          onChange={(v) =>
            !disabled &&
            dispatch(setField({ key: "qualification", value: v }))
          }
          disabled={disabled}
        />

        <OtherInline
          label="Specialization / Major"
          value={profile.specialization}
          options={toOptions(SPECIALIZATIONS)}
          onChange={(v) =>
            !disabled &&
            dispatch(setField({ key: "specialization", value: v }))
          }
          disabled={disabled}
        />

        <OtherInline
          label="Years of Experience"
          value={profile.experience}
          options={EXPERIENCE_OPTIONS}
          onChange={(v) =>
            !disabled && dispatch(setField({ key: "experience", value: v }))
          }
          disabled={disabled}
        />
      </div>
    </section>
  );
}
