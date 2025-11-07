"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setBulk } from "@/store/slices/studentProfileSlice";
import { getUserProfile, updateStudentProfile } from "@/services/profileService";

// Reuse CompleteProfile design components
import HeaderSection from "@/components/CompleteProfile/HeaderSection";
import PersonalInfoSection from "@/components/CompleteProfile/PersonalInfoSection";
import AcademicDetailsSection from "@/components/CompleteProfile/AcademicDetailsSection";
import PreferredSubjectsSection from "@/components/CompleteProfile/PreferredSubjectsSection";
import TutorPreferencesSection from "@/components/CompleteProfile/TutorPreferencesSection";

const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://127.0.0.1:5000";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function StudentProfilePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // -------- Fetch Profile & Populate Redux --------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res.success && res.data.profile) {
          const profileData = res.data.profile;
          dispatch(setBulk(profileData)); // ✅ hydrate Redux store
          setPhotoPreview(getImageUrl(profileData.photoUrl) || null);

        } else {
          toast.error("Profile not found");
        }
      } catch (err: any) {
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [dispatch]);

  // -------- Auto Disable / Enable Inputs --------
  useEffect(() => {
    // Run only when loading is done and form is rendered
    if (loading) return;

    const toggleFormInputs = () => {
      const form = document.getElementById("student-profile-form");
      if (!form) return;

      const inputs = form.querySelectorAll("input, textarea, select, button[type='radio']");
      inputs.forEach((input) => {
        (input as HTMLInputElement).disabled = !editMode;
      });
    };

    // Initial disable right after render
    const timer = setTimeout(() => toggleFormInputs(), 100);

    // Run again whenever editMode changes
    toggleFormInputs();

    return () => clearTimeout(timer);
  }, [editMode, loading]);


  // -------- Save Handler --------
  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();

      // ✅ Use latest Redux state (not stale formData)
      Object.keys(profile || {}).forEach((key) => {
        const value = (profile as any)[key];
        if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
        else if (value !== undefined && value !== null) fd.append(key, value);
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await updateStudentProfile(fd);
      if (res.success) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  // -------- UI --------
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(35,165,213,0.12),transparent),radial-gradient(900px_500px_at_-10%_20%,rgba(0,0,0,0.06),transparent)]">
      {/* —— Header —— */}
      <HeaderSection />

      {/* —— Hero —— */}
      <section className="py-12 border-b bg-gradient-to-br from-white to-primaryWeak/40">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Student Profile
            </h1>
            <p className="text-gray-600">
              Review or update your academic and tutor details.
            </p>
          </div>

          <div>
            {!editMode ? (
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* —— Main —— */}
      <main className="flex-grow">
        <form
          id="student-profile-form"
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
        >
          {/* 👤 Personal Info */}
          <PersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            errors={{}}
          />

          {/* 🎓 Academic */}
          <AcademicDetailsSection errors={{}} />

          {/* 📚 Preferred Subjects */}
          <PreferredSubjectsSection errors={{}} />

          {/* 👨‍🏫 Tutor Preferences */}
          <TutorPreferencesSection />

          {/* 💾 Save Button */}
          {editMode && (
            <div className="flex justify-end pt-6 border-t">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="animate-spin mr-2 w-4 h-4" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 w-4 h-4" /> Save Changes
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
