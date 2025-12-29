"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
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
          toast({
            title: "Profile not found",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error loading tutor profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch]);

  // Validation trigger on blur

  const handleSave = async () => {
    const validation = validateTutorProfile(profile);

    if (Object.keys(validation).length > 0) {
      toast({
        title: "Please fix highlighted errors",
        variant: "destructive",
      });
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
        toast({
          title: "Tutor profile updated",
        });
        setEditMode(false);
        router.push("/dashboard/tutor");
      } else {
        toast({
          title: "Update failed",
          description: res.message || "Update failed",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error saving profile",
        description: err.message || "Error saving profile",
        variant: "destructive",
      });
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
            disabled={!editMode}
          />

          <TutorAcademicSection disabled={!editMode} />
          <TutorSubjectsSection disabled={!editMode} />
          <TutorRatesAvailabilitySection disabled={!editMode} />
          <TutorAboutSection disabled={!editMode} />

          <TutorDemoVideoSection
            demoVideoFile={demoVideoFile}
            setDemoVideoFile={setDemoVideoFile}
            demoVideoUrl={demoVideoUrl}
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





