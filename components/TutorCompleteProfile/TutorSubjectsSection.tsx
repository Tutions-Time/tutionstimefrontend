"use client";
import { BookOpen } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";
import type { TutorProfileState } from "@/store/slices/tutorProfileSlice";
import { Label } from "@/components/ui/label";

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
  ],
  College: [
    "Economics",
    "Accountancy",
    "Engineering Physics",
    "Programming",
    "Microbiology",
    "Political Science",
  ],
  "Working Professional": [
    "Communication Skills",
    "Business English",
    "Aptitude",
    "Soft Skills",
    "Interview Preparation",
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
  School: ["CBSE", "ICSE", "State Board", "IB", "Cambridge"],
  College: ["University", "Autonomous College"],
  "Working Professional": ["N/A"],
};

const STUDENT_TYPES = ["School", "College", "Working Professional"];
const GROUP_SIZES = ["One-to-One", "Small Batch (2–5)", "Large Batch (6+)"];

/* ---------------------- Component ---------------------- */
export default function TutorSubjectsSection() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  // ✅ handle both array (multi) and string (single) types
  const toggleValue = <K extends keyof TutorProfileState>(
    key: K,
    arr: any,
    value: string
  ) => {
    let next: any;

    if (Array.isArray(arr)) {
      // For array-type fields → toggle selection
      next = arr.includes(value)
        ? arr.filter((v: string) => v !== value)
        : [...arr, value];
    } else {
      // For string-type fields → select or clear
      next = arr === value ? "" : value;
    }

    dispatch(setField({ key, value: next }));
  };

  const renderChips = <K extends keyof TutorProfileState>(
    key: K,
    options: string[],
    values: string[] = []
  ) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggleValue(key, values, opt)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              selected
                ? "bg-primary text-white border-primary"
                : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  const selectedTypes = profile.studentTypes || [];

  // ✅ Merge unique values of all selected types
  const combinedSubjects = selectedTypes.flatMap((type) => SUBJECTS[type] || []);
  const combinedClasses = selectedTypes.flatMap((type) => CLASS_LEVELS[type] || []);
  const combinedBoards = selectedTypes.flatMap((type) => BOARDS[type] || []);

  // ✅ Remove duplicates
  const uniqueSubjects = Array.from(new Set(combinedSubjects));
  const uniqueClasses = Array.from(new Set(combinedClasses));
  const uniqueBoards = Array.from(new Set(combinedBoards));

  return (
    <section className="bg-white rounded-2xl shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="text-primary w-5 h-5" />
        <h2 className="text-xl font-semibold">Subjects & Classes</h2>
      </div>

      <div className="space-y-8">
        {/* Step 1: Student Type */}
        <div>
          <Label className="block mb-2 font-medium">Preferred Student Type</Label>
          {renderChips("studentTypes", STUDENT_TYPES, selectedTypes)}
        </div>

        {/* Step 2: Dynamically show combined options for all selected types */}
        {selectedTypes.length > 0 && (
          <>
            <div>
              <Label className="block mb-2 font-medium">Subjects You Teach</Label>
              {renderChips("subjects", uniqueSubjects, profile.subjects || [])}
            </div>

            <div>
              <Label className="block mb-2 font-medium">Classes You Teach</Label>
              {renderChips("classLevels", uniqueClasses, profile.classLevels || [])}
            </div>

            <div>
              <Label className="block mb-2 font-medium">Boards / Curriculums</Label>
              {renderChips("boards", uniqueBoards, profile.boards || [])}
            </div>

            <div>
              <Label className="block mb-2 font-medium">Group Size Preference</Label>
              {renderChips(
                "groupSize",
                GROUP_SIZES,
                profile.groupSize ? [profile.groupSize] : []
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
