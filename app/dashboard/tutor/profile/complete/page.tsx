"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { updateTutorProfile } from "@/services/profileService";
import { startSubmitting, stopSubmitting, setBulk } from "@/store/slices/tutorProfileSlice";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import TutorPersonalInfoSection from "@/components/TutorCompleteProfile/TutorPersonalInfoSection";
import TutorAcademicSection from "@/components/TutorCompleteProfile/TutorAcademicSection";
import TutorSubjectsSection from "@/components/TutorCompleteProfile/TutorSubjectsSection";
import TutorRatesAvailabilitySection from "@/components/TutorCompleteProfile/TutorRatesAvailabilitySection";
import TutorAboutSection from "@/components/TutorCompleteProfile/TutorAboutSection";
import TutorDemoVideoSection from "@/components/TutorCompleteProfile/TutorDemoVideoSection";
import TutorResumeSection from "@/components/TutorCompleteProfile/TutorResumeSection";

export default function TutorProfileCompletePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const cache = localStorage.getItem("tt_tutor_prefill");
    if (cache) dispatch(setBulk(JSON.parse(cache)));
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("tt_tutor_prefill", JSON.stringify({ ...profile, isSubmitting: false }));
  }, [profile]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!profile.name?.trim()) e.name = "Name is required";
    if (!profile.email?.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) e.email = "Valid email required";
    if (!profile.pincode?.trim()) e.pincode = "Pincode required";
    if (!profile.qualification) e.qualification = "Qualification required";
    if (!profile.experience) e.experience = "Experience required";
    if (!profile.subjects?.length) e.subjects = "Select at least one subject";
    if (!profile.hourlyRate?.trim()) e.hourlyRate = "Hourly rate required";
    if (!profile.bio?.trim()) e.bio = "Bio is required";
    if (!demoVideoFile) e.demoVideo = "Upload a demo video";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      dispatch(startSubmitting());
      const fd = new FormData();
      Object.entries(profile).forEach(([k, v]) =>
        fd.append(k, typeof v === "object" ? JSON.stringify(v) : v || "")
      );
      if (photoFile) fd.append("photo", photoFile);
      if (demoVideoFile) fd.append("demoVideo", demoVideoFile);
      if (resumeFile) fd.append("resume", resumeFile);

      await updateTutorProfile(fd);
      dispatch(stopSubmitting());
      router.push("/dashboard/tutor");
    } catch {
      dispatch(stopSubmitting());
      alert("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white">T</div>
            <span className="font-bold text-xl">Tuitions Time</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-primaryWeak to-white py-10 border-b text-center">
        <h1 className="text-3xl font-bold mb-2">Complete Your Tutor Profile</h1>
        <p className="text-gray-600">Add your details, rates, and demo video to get started.</p>
      </section>

      {/* Form Sections */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
          <TutorPersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            errors={errors}
          />
          <TutorAcademicSection />
          <TutorSubjectsSection />
          <TutorRatesAvailabilitySection errors={errors} />
          <TutorAboutSection errors={errors} />
          <TutorDemoVideoSection
            demoVideoFile={demoVideoFile}
            setDemoVideoFile={setDemoVideoFile}
            errors={errors}
          />
          <TutorResumeSection
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
          />

          <div className="flex justify-between border-t pt-4">
            <SecondaryButton onClick={() => router.back()}>Back</SecondaryButton>
            <PrimaryButton onClick={handleSubmit} disabled={profile.isSubmitting}>
              {profile.isSubmitting ? "Saving…" : "Save & Continue"}
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
