"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setBulk } from "@/store/slices/studentProfileSlice";
import { getUserProfile, updateStudentProfile } from "@/services/profileService";

import { validateStudentProfileFields } from "@/utils/validators";

// Sections
import HeaderSection from "@/components/CompleteProfile/HeaderSection";
import PersonalInfoSection from "@/components/CompleteProfile/PersonalInfoSection";
import AcademicDetailsSection from "@/components/CompleteProfile/AcademicDetailsSection";
import PreferredSubjectsSection from "@/components/CompleteProfile/PreferredSubjectsSection";
import TutorPreferencesSection from "@/components/CompleteProfile/TutorPreferencesSection";
import PaymentPreferenceSection from "@/components/CompleteProfile/PaymentPreferenceSection";

export default function StudentProfilePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const [referralCode, setReferralCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [errors, setErrors] = useState({}); // ⭐ ADDED
  const router = useRouter();

  // -------- Fetch Profile --------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res.success && res.data.profile) {
          dispatch(setBulk(res.data.profile));
          setReferralCode(res.data?.referralCode || "");
        } else toast.error("Profile not found");
      } catch {
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [dispatch]);

  // -------- VALIDATION ON BLUR --------
  const updateFieldValidation = () => {
    const v = validateStudentProfileFields(profile);
    setErrors(v);
  };

  // -------- Save Handler --------
  const handleSave = async () => {
    const validation = validateStudentProfileFields(profile);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      toast.error("Please correct the highlighted fields");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      Object.entries(profile || {}).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else if (v !== undefined && v !== null) fd.append(k, v);
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await updateStudentProfile(fd);
      if (res.success) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
        router.push("/dashboard/student");
      } else toast.error(res.message || "Update failed");
    } catch (err: any) {
      toast.error(err.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(35,165,213,0.12),transparent),radial-gradient(900px_500px_at_-10%_20%,rgba(0,0,0,0.06),transparent)]">
      <HeaderSection/>

      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center h-16 px-6">
          <h1 className="text-xl md:text-2xl font-semibold">Student Profile</h1>

          <div className="flex items-center gap-3">
            {!editMode ? (
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setEditMode(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="rounded-2xl bg-white shadow-sm p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Your Referral Code</div>
              <div className="text-2xl font-bold">{referralCode || "—"}</div>
            </div>
            <button
              className="px-4 py-2 rounded-full border bg-gray-50 hover:bg-gray-100"
              onClick={() => referralCode && navigator.clipboard.writeText(referralCode)}
            >
              Copy
            </button>
          </div>
        </div>

        <form className="max-w-5xl mx-auto px-4 py-10 space-y-10">

          {/* PERSONAL INFO */}
          <PersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            errors={errors}
            disabled={!editMode}
            onValidate={updateFieldValidation} // ⭐ ADDED
          />

          <AcademicDetailsSection disabled={!editMode} errors={{}} />

          <PreferredSubjectsSection disabled={!editMode} errors={{}} />

          <PaymentPreferenceSection disabled={!editMode} />

          <TutorPreferencesSection disabled={!editMode} />

        </form>
      </main>
    </div>
  );
}
