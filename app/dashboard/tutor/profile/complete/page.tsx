"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
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

  // ---------- FILE STATES ----------
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [upiId, setUpiId] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  // Load saved data
  useEffect(() => {
    const cache = localStorage.getItem("tt_tutor_prefill");
    if (cache) dispatch(setBulk(JSON.parse(cache)));
  }, [dispatch]);

  // Preview Photo when selected
  useEffect(() => {
    if (photoFile) {
      setPhotoPreview(URL.createObjectURL(photoFile));
    }
  }, [photoFile]);

  // Save to cache
  useEffect(() => {
    localStorage.setItem(
      "tt_tutor_prefill",
      JSON.stringify({ ...profile, isSubmitting: false })
    );
  }, [profile]);

  // ---------- VALIDATION ----------
  const validate = () => {
    const e: Record<string, string> = {
      ...validateTutorProfile(profile),
    };

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
      };

      // Append normal fields
      Object.entries(cleanProfile).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v ?? "");
      });

      // Append files
      if (photoFile) fd.append("photo", photoFile);
      if (resumeFile) fd.append("resume", resumeFile);
      if (demoVideoFile) fd.append("demoVideo", demoVideoFile);

      fd.append("upiId", upiId || "");
      fd.append("accountHolderName", accountHolderName || "");
      fd.append("bankAccountNumber", bankAccountNumber || "");
      fd.append("ifsc", ifsc || "");

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
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white">
              T
            </div>
            <span className="font-bold text-xl">Tuitions Time</span>
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

          <div className="space-y-4 border p-4 rounded-xl">
            <div className="font-semibold">Payout Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">UPI ID</label>
                <input
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="yourname@bank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Account Holder Name</label>
                <input
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="Name as per bank"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Bank Account Number</label>
                <input
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="0000 0000 0000"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">IFSC</label>
                <input
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="XXXX0000000"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between border-t pt-4">
            <SecondaryButton onClick={() => router.back()}>
              Back
            </SecondaryButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={profile.isSubmitting || !profile.isAgeConfirmed}
            >
              {profile.isSubmitting ? "Savingâ€¦" : "Save & Continue"}
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}

