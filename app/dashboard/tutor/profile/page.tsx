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
import { useRouter } from "next/navigation";


// Tutor Sections
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
  const router = useRouter();

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

          setPhotoPreview(getImageUrl(tutor.photoUrl));
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

  // ⭐ VALIDATION TRIGGER ON BLUR
  const updateFieldValidation = () => {
    let v = validateTutorProfile(profile);

    if (!profile.phone) delete v.phone;

    setErrors(v);
  };

  const handleSave = async () => {
    let validation = validateTutorProfile(profile);

    if (!profile.phone) delete validation.phone;

    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      toast.error("Please fix highlighted errors");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      Object.entries(profile || {}).forEach(([k, v]) => {
        if (["photo", "resume", "demoVideo", "photoUrl", "resumeUrl", "demoVideoUrl"].includes(k))
          return;

        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v ?? "");
      });

      if (photoFile) fd.append("photo", photoFile);
      if (demoVideoFile) fd.append("demoVideo", demoVideoFile);
      if (resumeFile) fd.append("resume", resumeFile);

      const res = await updateTutorProfile(fd);

      if (res.success && res.data) {
        toast.success("Tutor profile updated!");
        setEditMode(false);
        router.push("/dashboard/tutor");
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

      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              T
            </div>
            <span className="font-semibold text-xl">Tutor Profile</span>
          </div>

          <div className="flex items-center gap-3">
            {!editMode ? (
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
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
                      <Save className="h-4 w-4 mr-2" /> Save Changes
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
        <form className="max-w-5xl mx-auto px-6 py-10 space-y-10">

          <TutorPersonalInfoSection
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            photoPreview={photoPreview}
            errors={errors}
            disabled={!editMode}
            onValidate={updateFieldValidation}   // ⭐ added
          />

          <TutorAcademicSection disabled={!editMode} />
          <TutorSubjectsSection disabled={!editMode} />
          <TutorRatesAvailabilitySection disabled={!editMode} errors={{}} />
          <TutorAboutSection disabled={!editMode} errors={{}} />

          <TutorDemoVideoSection
            demoVideoFile={demoVideoFile}
            setDemoVideoFile={setDemoVideoFile}
            demoVideoUrl={demoVideoUrl}
            disabled={!editMode}
            errors={{}}
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
