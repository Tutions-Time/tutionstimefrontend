"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setBulk } from "@/store/slices/tutorProfileSlice";
import { getUserProfile, updateTutorProfile } from "@/services/profileService";
import { getImageUrl } from "@/utils/getImageUrl";
import { validateTutorProfile } from "@/utils/validators";



// 🧩 Tutor sections
import TutorPersonalInfoSection from "@/components/TutorCompleteProfile/TutorPersonalInfoSection";
import TutorAcademicSection from "@/components/TutorCompleteProfile/TutorAcademicSection";
import TutorSubjectsSection from "@/components/TutorCompleteProfile/TutorSubjectsSection";
import TutorRatesAvailabilitySection from "@/components/TutorCompleteProfile/TutorRatesAvailabilitySection";
import TutorAboutSection from "@/components/TutorCompleteProfile/TutorAboutSection";
import TutorDemoVideoSection from "@/components/TutorCompleteProfile/TutorDemoVideoSection";
import TutorResumeSection from "@/components/TutorCompleteProfile/TutorResumeSection";

export default function TutorProfilePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);
  const [referralCode, setReferralCode] = useState<string>("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [demoVideoUrl, setDemoVideoUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});


 useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res.success && res.data.profile) {
        const tutor = res.data.profile;

        dispatch(setBulk(tutor));
        setReferralCode(res.data?.referralCode || "");

        // ✅ Correct photo
        setPhotoPreview(getImageUrl(tutor.photoUrl));

        // ✅ Correct video + resume
        setDemoVideoUrl(getImageUrl(tutor.demoVideoUrl));
        setResumeUrl(getImageUrl(tutor.resumeUrl));
      } else {
        toast.error("Profile not found");
      }
    } catch {
      toast.error("Error loading tutor profile");
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [dispatch]);


  const handleSave = async () => {
     const validation = validateTutorProfile(profile);
  setErrors(validation);

  if (Object.keys(validation).length > 0) {
    toast.error("Please fix highlighted errors");
    return;
  }
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

      if (photoFile) fd.append("photo", photoFile);
      if (resumeFile) fd.append("resume", resumeFile);
      if (demoVideoFile) fd.append("demoVideo", demoVideoFile);

      const res = await updateTutorProfile(fd);
      if (res.success && res.data) {
        toast.success("Tutor profile updated!");
        setEditMode(false);
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(35,165,213,0.12),transparent),radial-gradient(900px_500px_at_-10%_20%,rgba(0,0,0,0.06),transparent)]">
      {/* ===== Header ===== */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="font-semibold text-xl">Tutor Profile</span>
          </div>

          {/* ===== Header Actions ===== */}
          <div className="flex items-center gap-3">
            {!editMode ? (
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setEditMode(false)}
                  disabled={saving}
                >
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

      {/* ===== Main Form ===== */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="rounded-2xl bg-white shadow-sm p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Your Referral Code</div>
              <div className="text-2xl font-bold">{referralCode || '—'}</div>
            </div>
            <button
              className="px-4 py-2 rounded-full border bg-gray-50 hover:bg-gray-100"
              onClick={() => referralCode && navigator.clipboard.writeText(referralCode)}
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-muted mt-2">Share privately. You earn rewards after your referral’s first payment.</p>
        </div>
        <form
          id="tutor-profile-form"
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
        >
          <TutorPersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            photoPreview={photoPreview}
            errors={errors}
            disabled={!editMode}
          />
          <TutorAcademicSection disabled={!editMode} />
          <TutorSubjectsSection disabled={!editMode} />
          <TutorRatesAvailabilitySection errors={{}} disabled={!editMode} />
          <TutorAboutSection errors={{}} disabled={!editMode} />
          <TutorDemoVideoSection
            demoVideoFile={demoVideoFile}
            setDemoVideoFile={setDemoVideoFile}
            demoVideoUrl={demoVideoUrl}
            errors={{}}
            disabled={!editMode}
          />
          <TutorResumeSection
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            resumeUrl={resumeUrl}
            disabled={!editMode}
          />
        </form>
      </main>
    </div>
  );
}
