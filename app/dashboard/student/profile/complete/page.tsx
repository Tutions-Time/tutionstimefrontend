"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { updateStudentProfileThunk } from "@/store/slices/studentProfileSlice";


import {
  setField,
  setBulk,
  startSubmitting,
  stopSubmitting,
  validateStudentProfile,
} from "@/store/slices/studentProfileSlice";
import { Sparkles } from "lucide-react";

import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

// Imported modular components 👇
import HeaderSection from "@/components/CompleteProfile/HeaderSection";
import PersonalInfoSection from "@/components/CompleteProfile/PersonalInfoSection";
import AcademicDetailsSection from "@/components/CompleteProfile/AcademicDetailsSection";
import PreferredSubjectsSection from "@/components/CompleteProfile/PreferredSubjectsSection";
import TutorPreferencesSection from "@/components/CompleteProfile/TutorPreferencesSection";

export default function StudentProfileCompletePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---------- LocalStorage Prefill ----------
  useEffect(() => {
    try {
      const cache = localStorage.getItem("tt_student_prefill");
      if (cache) dispatch(setBulk(JSON.parse(cache)));
    } catch { }
  }, [dispatch]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "tt_student_prefill",
        JSON.stringify({ ...profile, isSubmitting: false })
      );
    } catch { }
  }, [profile]);

  // ---------- Validation ----------
  const validate = () => {
    const e = validateStudentProfile(profile);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

// ---------- Submit ----------
const handleSubmit = async () => {
  console.log('hi before validation');
  // if (!validate()) return;
  console.log('hi');

  const fd = new FormData();
  const appendIf = (k: string, v: any) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    if (Array.isArray(v) && v.length === 0) return;
    fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
  };

  const appendOtherPair = (base: string, other: string, baseVal: string, otherVal: string) => {
    if (!baseVal) return;
    appendIf(base, baseVal);
    if (baseVal === "Other") appendIf(other, otherVal);
  };

  try {
    dispatch(startSubmitting());

    // ===== PERSONAL =====
    appendIf("name", profile.name);
    appendIf("email", profile.email);
    appendIf("altPhone", profile.altPhone);
    appendIf("gender", profile.gender);
    if (profile.gender === "Other") appendIf("genderOther", profile.genderOther);

    // ===== ADDRESS =====
    appendIf("addressLine1", profile.addressLine1);
    appendIf("addressLine2", profile.addressLine2);
    appendIf("city", profile.city);
    appendIf("state", profile.state);
    appendIf("pincode", profile.pincode);

    // ===== TRACK =====
    appendIf("track", profile.track);

    // ===== SCHOOL TRACK =====
    if (profile.track === "school") {
      appendOtherPair("board", "boardOther", profile.board, profile.boardOther);
      appendOtherPair("classLevel", "classLevelOther", profile.classLevel, profile.classLevelOther);
      appendOtherPair("stream", "streamOther", profile.stream, profile.streamOther);
    }

    // ===== COLLEGE TRACK =====
    if (profile.track === "college") {
      appendOtherPair("program", "programOther", profile.program, profile.programOther);
      appendOtherPair("discipline", "disciplineOther", profile.discipline, profile.disciplineOther);
      appendOtherPair("yearSem", "yearSemOther", profile.yearSem, profile.yearSemOther);
    }

    // ===== COMPETITIVE TRACK =====
    if (profile.track === "competitive") {
      appendOtherPair("exam", "examOther", profile.exam, profile.examOther);
      appendIf("targetYear", profile.targetYear);
    }

    // ===== SUBJECTS & AVAILABILITY =====
    appendIf("subjects", profile.subjects);
    appendIf("subjectOther", profile.subjectOther);
    appendIf("availability", JSON.stringify(profile.availability || []));
    appendIf("goals", profile.goals);

    // ===== TUTOR PREFERENCES =====
    appendIf("tutorGenderPref", profile.tutorGenderPref);
    if (profile.tutorGenderPref === "Other")
      appendIf("tutorGenderOther", profile.tutorGenderOther);

    // ===== PHOTO =====
    if (photoFile) fd.append("photo", photoFile);

    // ===== SUBMIT =====
    const result = await dispatch(updateStudentProfileThunk(fd)).unwrap();
    dispatch(stopSubmitting());

    if ((result as any)?.success || (result as any)?.data) {
      router.push("/dashboard/student");
    } else {
      alert("Something went wrong. Try again later.");
    }
  } catch (err) {
    console.error(err);
    dispatch(stopSubmitting());
    alert("Something went wrong. Try again later.");
  }
};



  const disabled = profile.isSubmitting;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(35,165,213,0.12),transparent),radial-gradient(900px_500px_at_-10%_20%,rgba(0,0,0,0.06),transparent)]">
      {/* —— Header —— */}
      {/* <HeaderSection /> */}

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
          <PersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            errors={errors}
          />
          <AcademicDetailsSection errors={errors} />
          <PreferredSubjectsSection errors={errors} />
          <TutorPreferencesSection />
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <SecondaryButton type="button" onClick={() => router.back()}>
              Back
            </SecondaryButton>
            <PrimaryButton type="button" disabled={disabled} onClick={handleSubmit}>
              {disabled ? "Saving…" : "Save & Continue"}
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
