"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { updateStudentProfile as updateStudentProfileThunk } from "@/store/slices/profileSlice";
import {
  setField,
  setBulk,
  startSubmitting,
  stopSubmitting,
  validateStudentProfile,
} from "@/store/slices/studentProfileSlice";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  User,
  BookOpen,
  Target,
  GraduationCap,
  Upload,
  Calendar as CalendarIcon,
  Users2,
  Sparkles,
} from "lucide-react";
import AvailabilityPicker from "@/components/forms/AvailabilityPicker"; // returns string[] (YYYY-MM-DD)
import OtherInline from "@/components/forms/OtherInline";

// ---------- Static option data ----------
const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "Cambridge", "Other"] as const;
const CLASSES = [
  "Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8",
  "Class 9","Class 10","Class 11","Class 12","Other",
] as const;
const STREAMS = ["Science", "Commerce", "Humanities", "Other"] as const;

const PROGRAMS = ["Undergraduate", "Postgraduate", "Diploma", "Other"] as const;
const DISCIPLINES = [
  "Engineering/Tech","Science","Arts","Commerce/Management","Law","Medicine","Other",
] as const;
const YEAR_SEM = ["1","2","3","4","5","6","7","8","Other"] as const;

const EXAMS = [
  "JEE Main","JEE Advanced","NEET","CUET","UPSC","SSC","Banking","CAT","GATE","Other",
] as const;
const TARGET_YEARS = ["2026", "2027", "2028", "Other"] as const;

const SUBJECTS_SCHOOL_GENERIC = [
  "Mathematics","Physics","Chemistry","Biology","English","Hindi","Sanskrit","History",
  "Geography","Civics","Economics","Computer Science","Accountancy","Other",
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

const TUTOR_GENDER = ["No Preference", "Male", "Female", "Other"] as const;
const GENDER = ["Male", "Female", "Other"] as const;

// ---------- Helpers ----------
const toOptions = (arr: readonly string[]) => arr.map(v => ({ value: v, label: v }));

function useOtherChange(dispatch: ReturnType<typeof useAppDispatch>) {
  return (baseKey: string, otherKey: string, optionList: readonly string[]) =>
    (val: string) => {
      const isKnown = optionList.includes(val as any) || val === "";
      if (isKnown) {
        dispatch(setField({ key: baseKey as any, value: val }));
        if (val !== "Other") dispatch(setField({ key: otherKey as any, value: "" }));
      } else {
        dispatch(setField({ key: baseKey as any, value: "Other" }));
        dispatch(setField({ key: otherKey as any, value: val }));
      }
    };
}

export default function StudentProfileCompletePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const onOtherChange = useOtherChange(dispatch);

  // Prefill from localStorage
  useEffect(() => {
    try {
      const cache = localStorage.getItem("tt_student_prefill");
      if (cache) dispatch(setBulk(JSON.parse(cache)));
    } catch {}
  }, [dispatch]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "tt_student_prefill",
        JSON.stringify({ ...profile, isSubmitting: false })
      );
    } catch {}
  }, [profile]);

  // Derived Subjects after academic selections
  const subjectOptions = useMemo(() => {
    if (profile.track === "school") return [...SUBJECTS_SCHOOL_GENERIC];
    if (profile.track === "college") {
      const list = SUBJECTS_COLLEGE_BY_DISCIPLINE[profile.discipline || ""] ||
                   SUBJECTS_COLLEGE_BY_DISCIPLINE["Other"];
      return [...list];
    }
    if (profile.track === "competitive") {
      const list = SUBJECTS_COMP_BY_EXAM[profile.exam || ""] ||
                   SUBJECTS_COMP_BY_EXAM["Other"];
      return [...list];
    }
    return [];
  }, [profile.track, profile.discipline, profile.exam]);

  const toggleSubject = (subj: string) => {
    const exists = profile.subjects.includes(subj);
    const next = exists ? profile.subjects.filter((s) => s !== subj) : [...profile.subjects, subj];
    if (!next.includes("Other")) dispatch(setField({ key: "subjectOther", value: "" }));
    dispatch(setField({ key: "subjects", value: next }));
  };

  const onTrackChange = (val: "school" | "college" | "competitive" | "") => {
    const resets: Partial<typeof profile> = {
      board: "", boardOther: "", classLevel: "", classLevelOther: "", stream: "", streamOther: "",
      program: "", programOther: "", discipline: "", disciplineOther: "", yearSem: "", yearSemOther: "",
      exam: "", examOther: "", targetYear: "", targetYearOther: "",
      subjects: [], subjectOther: "",
    };
    dispatch(setBulk({ track: val, ...resets }));
  };

  const validate = () => {
    const e = validateStudentProfile(profile);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSubmit = async () => {
  if (!validate()) return;

  // tiny helpers
  const fd = new FormData();
  const appendIf = (k: string, v: any) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.trim() === '') return;
    if (Array.isArray(v) && v.length === 0) return;
    fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
  };
  const appendOtherPair = (baseKey: string, otherKey: string, baseVal: string, otherVal: string) => {
    if (!baseVal) return; // nothing selected
    appendIf(baseKey, baseVal);
    if (baseVal === 'Other') appendIf(otherKey, otherVal);
  };

  try {
    dispatch(startSubmitting());

    // ── Personal
    appendIf('name', profile.name);
    appendIf('email', profile.email);
    appendIf('altPhone', profile.altPhone);
    appendIf('gender', profile.gender);
    if (profile.gender === 'Other') appendIf('genderOther', profile.genderOther);

    // ── Address
    appendIf('addressLine1', profile.addressLine1);
    appendIf('addressLine2', profile.addressLine2);
    appendIf('city', profile.city);
    appendIf('state', profile.state);
    appendIf('pincode', profile.pincode);

    // ── Track + track-specific fields
    appendIf('track', profile.track);

    if (profile.track === 'school') {
      appendOtherPair('board', 'boardOther', profile.board, profile.boardOther);
      appendOtherPair('classLevel', 'classLevelOther', profile.classLevel, profile.classLevelOther);
      // stream only for Class 11/12
      if (['Class 11', 'Class 12'].includes(profile.classLevel)) {
        appendOtherPair('stream', 'streamOther', profile.stream, profile.streamOther);
      }
    }

    if (profile.track === 'college') {
      appendOtherPair('program', 'programOther', profile.program, profile.programOther);
      appendOtherPair('discipline', 'disciplineOther', profile.discipline, profile.disciplineOther);
      appendOtherPair('yearSem', 'yearSemOther', profile.yearSem, profile.yearSemOther);
    }

    if (profile.track === 'competitive') {
      appendOtherPair('exam', 'examOther', profile.exam, profile.examOther);
      appendOtherPair('targetYear', 'targetYearOther', profile.targetYear, profile.targetYearOther);
    }

    // ── Subjects
    appendIf('subjects', profile.subjects); // JSON stringified if non-empty
    if (profile.subjects.includes('Other')) appendIf('subjectOther', profile.subjectOther);

    // ── Tutor preferences
    appendIf('tutorGenderPref', profile.tutorGenderPref);
    if (profile.tutorGenderPref === 'Other') appendIf('tutorGenderOther', profile.tutorGenderOther);


fd.append('availability', JSON.stringify(profile.availability || []));


    // ── Misc
    appendIf('goals', profile.goals);
    if (photoFile) fd.append('photo', photoFile);

    const result = await dispatch(updateStudentProfileThunk(fd)).unwrap();
    dispatch(stopSubmitting());

    if ((result as any)?.success || (result as any)?.data) {
      router.push('/dashboard/student');
      return;
    }
    alert('Something went wrong. Try again later.');
  } catch (err) {
    console.error(err);
    dispatch(stopSubmitting());
    alert('Something went wrong. Try again later.');
  }
};
  const disabled = profile.isSubmitting;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(35,165,213,0.12),transparent),radial-gradient(900px_500px_at_-10%_20%,rgba(0,0,0,0.06),transparent)]">
      <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/90 text-white flex items-center justify-center font-bold shadow-sm">T</div>
            <span className="font-semibold text-lg text-gray-900">Tuitions time</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-4 h-4" />
            Smooth onboarding • Better matches
          </div>
        </div>
      </nav>

      {/* —— Hero —— */}
      <section className="py-12 border-b bg-gradient-to-br from-white to-primaryWeak/40">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Complete Your Student Profile
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tell us about your academics & preferences to unlock curated tutor recommendations.
          </p>
        </div>
      </section>

      {/* —— Main —— */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* ——— Section 1: Personal Info + Photo ——— */}
          <div className="bg-white/90 rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur p-8 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Photo */}
              <div className="flex justify-center md:justify-start">
                <button
                  type="button"
                  className="relative group"
                  onClick={() => document.getElementById("photoUpload")?.click()}
                >
                  <div className="h-28 w-28 rounded-full ring-2 ring-primary/30 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center overflow-hidden shadow-sm transition-all group-hover:shadow-md group-active:scale-[0.98]">
                    {photoFile ? (
                      <img src={URL.createObjectURL(photoFile)} alt="Profile" className="h-full w-full object-cover" />
                    ) : profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-primary text-white shadow-sm">
                    <Upload className="w-3 h-3" /> Upload
                  </span>
                </button>
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Fields */}
              <div className="md:col-span-2 space-y-5">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => dispatch(setField({ key: "name", value: e.target.value }))}
                    placeholder="e.g., Aditi Sharma"
                    className="h-10"
                  />
                  {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      onChange={(e) => dispatch(setField({ key: "email", value: e.target.value }))}
                      placeholder="you@example.com"
                      className="h-10"
                    />
                    {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="altPhone">Alternate Number (optional)</Label>
                    <Input
                      id="altPhone"
                      value={profile.altPhone}
                      onChange={(e) => dispatch(setField({ key: "altPhone", value: e.target.value }))}
                      placeholder="Alternate contact number"
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={profile.addressLine1}
                      onChange={(e) => dispatch(setField({ key: "addressLine1", value: e.target.value }))}
                      placeholder="House / Street"
                      className="h-10"
                    />
                    {errors.addressLine1 && <p className="text-rose-600 text-xs mt-1">{errors.addressLine1}</p>}
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
                    <Input
                      id="addressLine2"
                      value={profile.addressLine2}
                      onChange={(e) => dispatch(setField({ key: "addressLine2", value: e.target.value }))}
                      placeholder="Area / Landmark"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => dispatch(setField({ key: "city", value: e.target.value }))}
                      className="h-10"
                    />
                    {errors.city && <p className="text-rose-600 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profile.state}
                      onChange={(e) => dispatch(setField({ key: "state", value: e.target.value }))}
                      className="h-10"
                    />
                    {errors.state && <p className="text-rose-600 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={profile.pincode}
                      onChange={(e) => dispatch(setField({ key: "pincode", value: e.target.value }))}
                      placeholder="e.g., 110001"
                      className="h-10"
                    />
                    {errors.pincode && <p className="text-rose-600 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                {/* Gender (OtherInline kept as-is) */}
                <div className="grid md:grid-cols-2 gap-4">
                  <OtherInline
                    label="Gender"
                    value={profile.genderOther || profile.gender}
                    options={toOptions(GENDER)}
                    placeholder="Select"
                    onChange={onOtherChange("gender", "genderOther", GENDER)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ——— Section 2: Academic Details ——— */}
          <div className="bg-white/90 rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Academic Details</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Track */}
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
                          "flex items-center justify-center text-sm font-medium rounded-xl border cursor-pointer px-3 py-2 transition-all",
                          active
                            ? "bg-primary/10 border-primary/40 ring-2 ring-primary/30 text-primary"
                            : "hover:bg-gray-50 border-gray-200"
                        )}
                      >
                        <input
                          type="radio"
                          name="track"
                          className="hidden"
                          checked={active}
                          onChange={() => onTrackChange(t.key as any)}
                        />
                        {t.label}
                      </label>
                    );
                  })}
                </div>
                {errors.track && <p className="text-rose-600 text-xs mt-1">{errors.track}</p>}
              </div>

              {/* SCHOOL */}
              {profile.track === "school" && (
                <>
                  <OtherInline
                    label="Education Board"
                    value={profile.boardOther || profile.board}
                    options={toOptions(BOARDS)}
                    onChange={onOtherChange("board", "boardOther", BOARDS)}
                    className="md:col-span-1"
                  />
                  <OtherInline
                    label="Class"
                    value={profile.classLevelOther || profile.classLevel}
                    options={toOptions(CLASSES)}
                    onChange={onOtherChange("classLevel", "classLevelOther", CLASSES)}
                    className="md:col-span-1"
                  />
                  {["Class 11", "Class 12"].includes(profile.classLevel) && (
                    <OtherInline
                      label="Stream (for Class 11–12)"
                      value={profile.streamOther || profile.stream}
                      options={toOptions(STREAMS)}
                      onChange={onOtherChange("stream", "streamOther", STREAMS)}
                      className="md:col-span-1"
                    />
                  )}
                  {errors.board && <p className="text-rose-600 text-xs mt-1">{errors.board}</p>}
                  {errors.classLevel && <p className="text-rose-600 text-xs mt-1">{errors.classLevel}</p>}
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
                    className="md:col-span-1"
                  />
                  <OtherInline
                    label="Discipline"
                    value={profile.disciplineOther || profile.discipline}
                    options={toOptions(DISCIPLINES)}
                    onChange={onOtherChange("discipline", "disciplineOther", DISCIPLINES)}
                    className="md:col-span-1"
                  />
                  <OtherInline
                    label="Year / Semester"
                    value={profile.yearSemOther || profile.yearSem}
                    options={toOptions(YEAR_SEM)}
                    onChange={onOtherChange("yearSem", "yearSemOther", YEAR_SEM)}
                    className="md:col-span-1"
                  />
                  {errors.program && <p className="text-rose-600 text-xs mt-1">{errors.program}</p>}
                  {errors.discipline && <p className="text-rose-600 text-xs mt-1">{errors.discipline}</p>}
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
                    className="md:col-span-1"
                  />
                  <OtherInline
                    label="Target Year"
                    value={profile.targetYearOther || profile.targetYear}
                    options={toOptions(TARGET_YEARS)}
                    onChange={onOtherChange("targetYear", "targetYearOther", TARGET_YEARS)}
                    className="md:col-span-1"
                  />
                  {errors.exam && <p className="text-rose-600 text-xs mt-1">{errors.exam}</p>}
                </>
              )}
            </div>
          </div>

          {/* ——— Section 3: Preferred Subjects ——— */}
          <div className="bg-white/90 rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Preferred Subjects</h2>
            </div>

            {profile.track ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {subjectOptions.map((s) => {
                    const active = profile.subjects.includes(s);
                    return (
                      <label
                        key={s}
                        className={cn(
                          "flex items-center justify-center text-sm rounded-xl border px-3 py-2 cursor-pointer transition-all",
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
                </div>
                {profile.subjects.includes("Other") && (
                  <div className="mt-3 max-w-md">
                    <Label className="mb-1 block">Other Subject</Label>
                    <Input
                      value={profile.subjectOther}
                      onChange={(e) => dispatch(setField({ key: "subjectOther", value: e.target.value }))}
                      placeholder="Type other subject"
                      className="h-10"
                    />
                  </div>
                )}
                {errors.subjects && <p className="text-rose-600 text-xs mt-2">{errors.subjects}</p>}
                {errors.subjectOther && <p className="text-rose-600 text-xs mt-1">{errors.subjectOther}</p>}
              </>
            ) : (
              <p className="text-sm text-gray-600">Select your learning track above to see relevant subjects.</p>
            )}
          </div>

          {/* ——— Section 4: Tutor Preferences ——— */}
          <div className="bg-white/90 rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Tutor Preferences</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <OtherInline
                label="Preferred Tutor Gender"
                value={profile.tutorGenderOther || profile.tutorGenderPref}
                options={toOptions(TUTOR_GENDER)}
                onChange={onOtherChange("tutorGenderPref", "tutorGenderOther", TUTOR_GENDER)}
              />

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <Label>Availability (Select Dates)</Label>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Array.isArray(profile.availability) ? profile.availability.length : 0} date(s) selected
                  </span>
                </div>

                <AvailabilityPicker
                  value={profile.availability as unknown as string[]}
                  onChange={(next) => dispatch(setField({ key: "availability", value: next }))}
                />
              </div>
            </div>
          </div>

          {/* —— Buttons —— */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <SecondaryButton type="button" onClick={() => router.back()}>
              Back
            </SecondaryButton>
            <div className="flex items-center gap-3">
              <PrimaryButton type="button" disabled={disabled} onClick={handleSubmit}>
                {disabled ? "Saving…" : "Save & Continue"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
