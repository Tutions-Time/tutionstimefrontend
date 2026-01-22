"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useAuth } from "@/hooks/useAuth";

import { updateStudentProfileThunk } from "@/store/slices/studentProfileSlice";
import { setBulk, startSubmitting, stopSubmitting, setField } from "@/store/slices/studentProfileSlice";

import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

import HeaderSection from "@/components/CompleteProfile/HeaderSection";
import PersonalInfoSection from "@/components/CompleteProfile/PersonalInfoSection";
import AcademicDetailsSection from "@/components/CompleteProfile/AcademicDetailsSection";
import PreferredSubjectsSection from "@/components/CompleteProfile/PreferredSubjectsSection";
import TutorPreferencesSection from "@/components/CompleteProfile/TutorPreferencesSection";

import { validateStudentProfileFields } from "@/utils/validators";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { setUser } from "@/store/slices/authSlice";


export default function StudentProfileCompletePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const userEmail = useAppSelector((s) => s.auth.user?.email);
  const { logout } = useAuth();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // ---------- Prefill ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tt_student_prefill");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.userId || parsed.userId !== userId) {
        localStorage.removeItem("tt_student_prefill");
        return;
      }
      if (parsed.data) dispatch(setBulk(parsed.data));
    } catch {
      localStorage.removeItem("tt_student_prefill");
    }
  }, [dispatch, userId]);

  useEffect(() => {
    try {
      if (!userId) return;
      localStorage.setItem(
        "tt_student_prefill",
        JSON.stringify({ userId, data: { ...profile, isSubmitting: false } })
      );
    } catch {}
  }, [profile, userId]);

  useEffect(() => {
    if (userEmail && userEmail !== profile.email) {
      dispatch(setField({ key: "email", value: userEmail }));
    }
  }, [dispatch, userEmail, profile.email]);

  // ---------- Validation ----------
  const validate = () => {
    const e = validateStudentProfileFields(profile);
    if (!photoFile && !profile.photoUrl) {
      e.photoUrl = "Profile photo is required";
    }
    if (Object.keys(e).length > 0) {
      // Show each error as toast
      Object.values(e).forEach((msg) => {
        if (msg) toast({
          title: "Validation Error",
          description: msg,
          variant: "destructive",
        });

      });
      return false;
    }

    return true;
  };


  // ---------- Submit ----------
  const handleSubmit = async () => {
    if (!validate()) return;

    const fd = new FormData();
    const appendIf = (k: string, v: any) => {
      if (v === undefined || v === null) return;
      if (typeof v === "string" && v.trim() === "") return;
      if (Array.isArray(v) && v.length === 0) return;
      fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
    };

    dispatch(startSubmitting());

    try {
      // ---------- PERSONAL ----------
      appendIf("name", profile.name);
      appendIf("email", profile.email);
      appendIf("altPhone", profile.altPhone);
      appendIf("gender", profile.gender);
      if (profile.gender === "Other") {
        appendIf("genderOther", profile.genderOther);
      }
      appendIf("learningMode", profile.learningMode);

      // ---------- ADDRESS ----------
      appendIf("addressLine1", profile.addressLine1);
      appendIf("addressLine2", profile.addressLine2);
      appendIf("city", profile.city);
      appendIf("state", profile.state);
      appendIf("pincode", profile.pincode);

      // ---------- ACADEMIC ----------
      appendIf("track", profile.track);
      
      // School
      appendIf("board", profile.board);
      if (profile.board === "Other") appendIf("boardOther", profile.boardOther);
      appendIf("classLevel", profile.classLevel);
      if (profile.classLevel === "Other") appendIf("classLevelOther", profile.classLevelOther);
      appendIf("stream", profile.stream);
      if (profile.stream === "Other") appendIf("streamOther", profile.streamOther);

      // College
      appendIf("program", profile.program);
      if (profile.program === "Other") appendIf("programOther", profile.programOther);
      appendIf("discipline", profile.discipline);
      if (profile.discipline === "Other") appendIf("disciplineOther", profile.disciplineOther);
      appendIf("yearSem", profile.yearSem);
      if (profile.yearSem === "Other") appendIf("yearSemOther", profile.yearSemOther);

      // Competitive
      appendIf("exam", profile.exam);
      if (profile.exam === "Other") appendIf("examOther", profile.examOther);
      appendIf("targetYear", profile.targetYear);
      if (profile.targetYear === "Other") appendIf("targetYearOther", profile.targetYearOther);

      // ---------- PREFERENCES ----------
      appendIf("subjects", profile.subjects);

      appendIf("tutorGenderPref", profile.tutorGenderPref);
      if (profile.tutorGenderPref === "Other") {
        appendIf("tutorGenderOther", profile.tutorGenderOther);
      }
      
      appendIf("preferredTimes", profile.preferredTimes);
      appendIf("availability", profile.availability);
      appendIf("goals", profile.goals);

      // ---------- PHOTO ----------
      if (photoFile) fd.append("photo", photoFile);

      // 🔥 IMPORTANT: unwrap = success if no error thrown
      await dispatch(updateStudentProfileThunk(fd)).unwrap();

      try {
        const response = await api.get("/auth/me");
        dispatch(setUser(response.data.user));
        const cookiePayload = {
          role: response.data.user.role,
          isProfileComplete: response.data.user.isProfileComplete,
        };
        document.cookie = `auth=${encodeURIComponent(
          JSON.stringify(cookiePayload)
        )}; path=/; max-age=2592000`;
      } catch {}

      // dispatch(stopSubmitting());

      // ✅ ALWAYS redirect on success
      console.log("REDIRECTING NOW");
      router.replace("/dashboard/student");
    } catch (err) {
      console.error(err);
      dispatch(stopSubmitting());

      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    }
  };


  const disabled = profile.isSubmitting;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(35,165,213,0.12),transparent),radial-gradient(900px_500px_at_-10%_20%,rgba(0,0,0,0.06),transparent)]">
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

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <PersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
          />

          <AcademicDetailsSection />
          <PreferredSubjectsSection />
          <TutorPreferencesSection />

          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <SecondaryButton
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/");
              }}
            >
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
