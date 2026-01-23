"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Image from "next/image";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

import TutorPersonalInfoSection from "@/components/TutorCompleteProfile/TutorPersonalInfoSection";
import TutorAcademicSection from "@/components/TutorCompleteProfile/TutorAcademicSection";
import TutorSubjectsSection from "@/components/TutorCompleteProfile/TutorSubjectsSection";
import TutorRatesAvailabilitySection from "@/components/TutorCompleteProfile/TutorRatesAvailabilitySection";
import TutorAboutSection from "@/components/TutorCompleteProfile/TutorAboutSection";
import TutorDemoVideoSection from "@/components/TutorCompleteProfile/TutorDemoVideoSection";
import TutorResumeSection from "@/components/TutorCompleteProfile/TutorResumeSection";
import { toast } from "@/hooks/use-toast";
import TutorAgeConfirmationSection from
  "@/components/TutorCompleteProfile/TutorAgeConfirmationSection";


import {
  startSubmitting,
  stopSubmitting,
  setBulk,
} from "@/store/slices/tutorProfileSlice";
import { updateTutorProfile } from "@/services/profileService";
import { validateTutorProfile } from "@/utils/validators";
import api from "@/lib/api";
import { setUser } from "@/store/slices/authSlice";

export default function TutorProfileCompletePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const userEmail = useAppSelector((s) => s.auth.user?.email);

  // ---------- FILE STATES ----------
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Load saved data
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tt_tutor_prefill");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.userId || parsed.userId !== userId) {
        localStorage.removeItem("tt_tutor_prefill");
        return;
      }
      if (parsed.data) dispatch(setBulk(parsed.data));
    } catch {
      localStorage.removeItem("tt_tutor_prefill");
    }
  }, [dispatch, userId]);

  // Preview Photo when selected
  useEffect(() => {
    if (photoFile) {
      setPhotoPreview(URL.createObjectURL(photoFile));
    }
  }, [photoFile]);

  // Save to cache
  useEffect(() => {
    try {
      if (!userId) return;
      localStorage.setItem(
        "tt_tutor_prefill",
        JSON.stringify({ userId, data: { ...profile, isSubmitting: false } })
      );
    } catch {}
  }, [profile, userId]);

  useEffect(() => {
    if (userEmail) {
      dispatch(setBulk({ email: userEmail }));
    }
  }, [dispatch, userEmail]);

  // ---------- VALIDATION ----------
  const validate = () => {
    const e: Record<string, string | undefined> = {
      ...validateTutorProfile(profile),
    };

    const hasPhoto = Boolean(photoFile || profile.photoUrl);
    if (!hasPhoto) e.photoUrl = "Profile photo is required";
    const hasResume = Boolean(resumeFile || profile.resumeUrl);
    if (!hasResume) e.resumeUrl = "Resume is required";
    const hasDemoVideo = Boolean(demoVideoFile || profile.demoVideoUrl);
    if (!hasDemoVideo) e.demoVideo = "Upload a demo video";
    if (!profile.isAgeConfirmed)
      e.isAgeConfirmed = "You must confirm that you are 18+";

    const msgs = Object.values(e).filter(Boolean) as string[];

    if (msgs.length > 0) {
      msgs.forEach((msg) =>
        toast({
          title: "Validation Error",
          description: msg,
          variant: "destructive",
        })
      );

      return false;
    }

    return true;
  };


  const clearAllStateAndCache = () => {
    // Clear file states
    setPhotoFile(null);
    setPhotoPreview(null);
    setDemoVideoFile(null);
    setResumeFile(null);

    // Clear local storage cache
    localStorage.removeItem("tt_tutor_prefill");

    // Reset redux slice fields to empty
    dispatch(
      setBulk({
        name: "",
        email: "",
        gender: "",
        altPhone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        qualification: "",
        specialization: "",
        experience: "",
        teachingMode: "",
        subjects: [],
        classLevels: [],
        boards: [],
        exams: [],
        studentTypes: [],
        groupSize: "",
        groupSizes: [],
        hourlyRate: "",
        monthlyRate: "",
        availableDays: [],
        bio: "",
        achievements: "",
        phone: "",
        isSubmitting: false,
      })
    );
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      dispatch(startSubmitting());

      const fd = new FormData();

      const cleanProfile = {
        name: profile.name,
        email: profile.email,
        gender: profile.gender,
        addressLine1: profile.addressLine1,
        addressLine2: profile.addressLine2,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        qualification: profile.qualification,
        specialization: profile.specialization,
        experience: profile.experience,
        teachingMode: profile.teachingMode,
        subjects: profile.subjects,
        classLevels: profile.classLevels,
        boards: profile.boards,
        exams: profile.exams,
        studentTypes: profile.studentTypes,
        groupSize: profile.groupSize,
        groupSizes:
          Array.isArray(profile.groupSizes) && profile.groupSizes.length
            ? profile.groupSizes
            : profile.groupSize
            ? [profile.groupSize]
            : [],
        hourlyRate: profile.hourlyRate,
        monthlyRate: profile.monthlyRate,
        availability: profile.availability,
        availableDays: profile.availableDays || [],
        bio: profile.bio,
        achievements: profile.achievements,
        phone: profile.phone || "",
        altPhone: profile.altPhone || "",
        isAgeConfirmed: profile.isAgeConfirmed,
      };

      // Append normal fields
      Object.entries(cleanProfile).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, String(v ?? ""));
      });

      // Append files
      if (photoFile) fd.append("photo", photoFile);
      if (resumeFile) fd.append("resume", resumeFile);
      if (demoVideoFile) fd.append("demoVideo", demoVideoFile);

      // Call your existing API (single endpoint)
      await updateTutorProfile(fd);

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

      // âœ… CLEAR ALL FIELDS + FILES + LOCAL STORAGE BEFORE REDIRECT (SUCCESS)
      clearAllStateAndCache();
      dispatch(stopSubmitting());
      router.push("/dashboard/tutor");
    } catch (err) {
      dispatch(stopSubmitting());
      const message =
        err instanceof Error ? err.message : "Please fix the errors and try again.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Tuitions Time"
              width={200}
              height={32}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-primaryWeak to-white py-10 border-b text-center">
        <h1 className="text-3xl font-bold mb-2">Complete Your Tutor Profile</h1>
        <p className="text-gray-600">
          Add your details, rates, and demo video to get started.
        </p>
      </section>

      {/* Form Sections */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
          <TutorPersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            photoPreview={photoPreview}
          />

          <TutorAcademicSection />
          <TutorSubjectsSection />
          <TutorRatesAvailabilitySection />
          <TutorAboutSection />

          <TutorDemoVideoSection
            demoVideoFile={demoVideoFile}
            setDemoVideoFile={setDemoVideoFile}
          />

        <TutorResumeSection
          resumeFile={resumeFile}
          setResumeFile={setResumeFile}
        />

        <TutorAgeConfirmationSection />

          <div className="flex justify-between border-t pt-4">
            <SecondaryButton onClick={() => router.back()}>
              Back
            </SecondaryButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={profile.isSubmitting || !profile.isAgeConfirmed}
            >
              {profile.isSubmitting ? "Saving..." : "Save & Continue"}
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}

