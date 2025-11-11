"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setBulk } from "@/store/slices/tutorProfileSlice";
import { getUserProfile, updateTutorProfile } from "@/services/profileService";

// 🧩 Tutor sections
import TutorPersonalInfoSection from "@/components/TutorCompleteProfile/TutorPersonalInfoSection";
import TutorAcademicSection from "@/components/TutorCompleteProfile/TutorAcademicSection";
import TutorSubjectsSection from "@/components/TutorCompleteProfile/TutorSubjectsSection";
import TutorRatesAvailabilitySection from "@/components/TutorCompleteProfile/TutorRatesAvailabilitySection";
import TutorAboutSection from "@/components/TutorCompleteProfile/TutorAboutSection";
import TutorDemoVideoSection from "@/components/TutorCompleteProfile/TutorDemoVideoSection";
import TutorResumeSection from "@/components/TutorCompleteProfile/TutorResumeSection";

const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  const base = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5000";
  // ✅ Ensure correct slash between base and path
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};


export default function TutorProfilePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  // ------- Local States -------
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [demoVideoUrl, setDemoVideoUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // -------- Fetch Profile --------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res.success && res.data.profile) {
          const tutor = res.data.profile;
          dispatch(setBulk(tutor));

          // ✅ Prefill media URLs
          setPhotoPreview(getImageUrl(tutor.photoUrl));
          setDemoVideoUrl(getImageUrl(tutor.demoVideoUrl));
          setResumeUrl(getImageUrl(tutor.resumeUrl));
        } else toast.error("Profile not found");
      } catch {
        toast.error("Error loading tutor profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [dispatch]);

  // -------- Toggle Input Disable --------
  useEffect(() => {
    if (loading) return;
    const form = document.getElementById("tutor-profile-form");
    if (!form) return;
    const inputs = form.querySelectorAll(
      "input, textarea, select, button[type='radio']"
    );
    inputs.forEach((input) => {
      if ((input as HTMLInputElement).type === "file") return;
      (input as HTMLInputElement).disabled = !editMode;
    });
  }, [editMode, loading]);

  // -------- Save --------
  const handleSave = async () => {
    try {
      setSaving(true);

      const fd = new FormData();

      Object.entries(profile || {}).forEach(([k, v]) => {
        if (
          ["photo", "resume", "demoVideo", "photoUrl", "resumeUrl", "demoVideoUrl"].includes(k)
        )
          return;
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v ?? "");
      });

      if (photoFile instanceof File) {
        fd.append("photo", photoFile);
      }
      if (resumeFile instanceof File) {
        fd.append("resume", resumeFile);
      }
      if (demoVideoFile instanceof File) {
        fd.append("demoVideo", demoVideoFile);
      }

      const res = await updateTutorProfile(fd);

      if (res.success && res.data) {
        toast.success("Tutor profile updated!");
        setEditMode(false);

        // ✅ Update preview URLs from response
        const { photoUrl, resumeUrl, demoVideoUrl } = res.data;
        setPhotoPreview(getImageUrl(photoUrl));
        setDemoVideoUrl(getImageUrl(demoVideoUrl));
        setResumeUrl(getImageUrl(resumeUrl));
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  // -------- Loading State --------
  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );

  // -------- UI --------
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(35,165,213,0.12),transparent),radial-gradient(900px_500px_at_-10%_20%,rgba(0,0,0,0.06),transparent)]">
      {/* —— Header —— */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="font-semibold text-xl">Tutor Profile</span>
          </div>

          {!editMode ? (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          )}
        </div>
      </header>

      {/* —— Hero —— */}
      <section className="py-10 border-b bg-gradient-to-br from-white to-primaryWeak/40 text-center">
        <h1 className="text-3xl font-bold mb-2">Tutor Profile</h1>
        <p className="text-gray-600">
          View or update your teaching details and credentials.
        </p>
      </section>

      {/* —— Main —— */}
      <main className="flex-grow">
        <form
          id="tutor-profile-form"
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
        >
          {/* 🧍 Personal Info */}
          <TutorPersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            photoPreview={photoPreview} // ✅ pass preview
            errors={{}}
          />

          {/* 🎓 Academic */}
          <TutorAcademicSection />

          {/* 📚 Subjects */}
          <TutorSubjectsSection />

          {/* 💰 Rates & Availability */}
          <TutorRatesAvailabilitySection errors={{}} />

          {/* 🧠 About / Bio */}
          <TutorAboutSection errors={{}} />

          {/* 🎥 Demo Video */}
          <TutorDemoVideoSection
            demoVideoFile={demoVideoFile}
            setDemoVideoFile={setDemoVideoFile}
            demoVideoUrl={demoVideoUrl} // ✅ show from API
            errors={{}}
          />

          {/* 📄 Resume */}
          <TutorResumeSection
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            resumeUrl={resumeUrl} // ✅ show from API
          />

          {/* 💾 Save */}
          {editMode && (
            <div className="flex justify-end border-t pt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
