"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { updateTutorProfile } from "@/services/profileService";
import {
  setField,
  setBulk,
  startSubmitting,
  stopSubmitting,
} from "@/store/slices/tutorProfileSlice";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  User,
  GraduationCap,
  BookOpen,
  Wallet,
  Target,
  PlayCircle,
  FileText,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import OtherInline from "@/components/forms/OtherInline";
import AvailabilityPicker from "@/components/forms/AvailabilityPicker";

/* -------------------- Filter-driven options -------------------- */
const QUALIFICATIONS = [
  "B.Sc",
  "M.Sc",
  "B.Tech",
  "M.Tech",
  "B.A",
  "M.A",
  "B.Ed",
  "M.Ed",
  "Ph.D",
  "Other",
];
const SPECIALIZATIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "Economics",
  "Accountancy",
  "History",
  "Other",
];
const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1–2 years",
  "3–5 years",
  "6–10 years",
  "10+ years",
];
const TEACHING_MODES = ["Online", "Offline", "Both"];
const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Economics",
  "Accountancy",
  "Computer Science",
  "Other",
];
const CLASS_LEVELS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Undergraduate",
  "Postgraduate",
  "Other",
];
const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "Cambridge", "Other"];
const EXAMS = ["JEE", "NEET", "CUET", "UPSC", "SSC", "Banking", "CAT", "Other"];
const STUDENT_TYPES = ["School", "College", "Working Professional"];
const GROUP_SIZES = ["One-to-One", "Small Batch (2–5)", "Large Batch (6+)"];
const GENDER = ["Male", "Female", "Other"];

const MAX_VIDEO_MB = 100;
const MAX_RESUME_MB = 10;

const toOptions = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

export default function TutorProfileCompletePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  // Local file states for previews
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* -------------------- Prefill / Persist -------------------- */
  useEffect(() => {
    try {
      const cache = localStorage.getItem("tt_tutor_prefill");
      if (cache) dispatch(setBulk(JSON.parse(cache)));
    } catch {}
  }, [dispatch]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "tt_tutor_prefill",
        JSON.stringify({ ...profile, isSubmitting: false })
      );
    } catch {}
  }, [profile]);

  /* -------------------- Validation -------------------- */
  const setError = (k: string, m: string) =>
    setErrors((p) => ({ ...p, [k]: m }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!profile.name?.trim()) e.name = "Name is required";
    if (!profile.email?.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))
      e.email = "Valid email required";
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

  /* -------------------- Handlers -------------------- */
  const onPickDemoVideo = (f: File) => {
    if (!f) return;
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_MB)
      return setError("demoVideo", `Max ${MAX_VIDEO_MB}MB allowed`);
    setDemoVideoFile(f);
    setError("demoVideo", "");
  };

  const onPickResume = (f: File) => {
    if (!f) return;
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_RESUME_MB)
      return setError("resume", `Max ${MAX_RESUME_MB}MB allowed`);
    setResumeFile(f);
    setError("resume", "");
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      dispatch(startSubmitting());
      const fd = new FormData();

      // Personal
      fd.append("name", profile.name);
      fd.append("email", profile.email);
      fd.append("gender", profile.gender);
      fd.append("addressLine1", profile.addressLine1 || "");
      fd.append("addressLine2", profile.addressLine2 || "");
      fd.append("city", profile.city || "");
      fd.append("state", profile.state || "");
      fd.append("pincode", profile.pincode);

      // Academic & teaching
      fd.append("teachingMode", profile.teachingMode);
      fd.append("qualification", profile.qualification);
      fd.append("specialization", profile.specialization);
      fd.append("experience", profile.experience);

      // Subjects & filter-driven fields
      fd.append("subjects", JSON.stringify(profile.subjects || []));
      fd.append("classLevels", JSON.stringify(profile.classLevels || []));
      fd.append("boards", JSON.stringify(profile.boards || []));
      fd.append("exams", JSON.stringify(profile.exams || []));
      fd.append("studentTypes", JSON.stringify(profile.studentTypes || []));
      fd.append("groupSize", profile.groupSize || "");

      // Rates & availability
      fd.append("hourlyRate", profile.hourlyRate);
      fd.append("monthlyRate", profile.monthlyRate || "");
      fd.append("availability", JSON.stringify(profile.availability || []));

      // About
      fd.append("bio", profile.bio);
      fd.append("achievements", profile.achievements || "");

      // Files
      if (photoFile) fd.append("photo", photoFile);
      if (demoVideoFile) fd.append("demoVideo", demoVideoFile);
      if (resumeFile) fd.append("resume", resumeFile);

      await updateTutorProfile(fd);
      dispatch(stopSubmitting());
      router.push("/dashboard/tutor");
    } catch (err) {
      console.error(err);
      dispatch(stopSubmitting());
      alert("Something went wrong. Try again later.");
    }
  };

  const disabled = profile.isSubmitting;

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white">
              T
            </div>
            <span className="font-bold text-xl text-text">Tuitions Time</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-primaryWeak to-white py-10 border-b text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Complete Your Tutor Profile
        </h1>
        <p className="text-gray-600">
          Add your details, rates, and demo video to get started.
        </p>
      </section>

      {/* Form */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* 1) Personal */}
          <section className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Photo */}
              <div className="flex justify-center md:justify-start">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => document.getElementById("photoUpload")?.click()}
                >
                  <div className="h-28 w-28 rounded-full border-2 border-primary flex items-center justify-center overflow-hidden shadow-md bg-gray-50">
                    {photoFile ? (
                      <img
                        src={URL.createObjectURL(photoFile)}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                </div>
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Fields */}
              <div className="md:col-span-2 space-y-5">
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    dispatch(setField({ key: "name", value: e.target.value }))
                  }
                  placeholder="Full Name"
                  className="h-10"
                />

                <Input
                  value={profile.email}
                  onChange={(e) =>
                    dispatch(setField({ key: "email", value: e.target.value }))
                  }
                  placeholder="Email"
                  className="h-10"
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <OtherInline
                    label="Gender"
                    value={profile.gender}
                    options={toOptions(GENDER)}
                    onChange={(v) =>
                      dispatch(setField({ key: "gender", value: v }))
                    }
                  />
                  <OtherInline
                    label="Teaching Mode"
                    value={profile.teachingMode}
                    options={toOptions(TEACHING_MODES)}
                    onChange={(v) =>
                      dispatch(setField({ key: "teachingMode", value: v }))
                    }
                  />
                </div>

                <Input
                  placeholder="Address Line 1"
                  value={profile.addressLine1}
                  onChange={(e) =>
                    dispatch(setField({ key: "addressLine1", value: e.target.value }))
                  }
                  className="h-10"
                />
                <Input
                  placeholder="Address Line 2"
                  value={profile.addressLine2}
                  onChange={(e) =>
                    dispatch(setField({ key: "addressLine2", value: e.target.value }))
                  }
                  className="h-10"
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    placeholder="City"
                    value={profile.city}
                    onChange={(e) =>
                      dispatch(setField({ key: "city", value: e.target.value }))
                    }
                    className="h-10"
                  />
                  <Input
                    placeholder="State"
                    value={profile.state}
                    onChange={(e) =>
                      dispatch(setField({ key: "state", value: e.target.value }))
                    }
                    className="h-10"
                  />
                  <Input
                    placeholder="Pincode"
                    value={profile.pincode}
                    onChange={(e) =>
                      dispatch(setField({ key: "pincode", value: e.target.value }))
                    }
                    className="h-10"
                  />
                </div>
                {errors.pincode && (
                  <p className="text-rose-600 text-xs">{errors.pincode}</p>
                )}
              </div>
            </div>
          </section>

          {/* 2) Academic & Teaching */}
          <section className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold">Academic & Teaching</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <OtherInline
                label="Highest Qualification"
                value={profile.qualification}
                options={toOptions(QUALIFICATIONS)}
                onChange={(v) =>
                  dispatch(setField({ key: "qualification", value: v }))
                }
              />
              <OtherInline
                label="Specialization / Major"
                value={profile.specialization}
                options={toOptions(SPECIALIZATIONS)}
                onChange={(v) =>
                  dispatch(setField({ key: "specialization", value: v }))
                }
              />
              <OtherInline
                label="Experience"
                value={profile.experience}
                options={toOptions(EXPERIENCE_OPTIONS)}
                onChange={(v) =>
                  dispatch(setField({ key: "experience", value: v }))
                }
              />
            </div>
          </section>

          {/* 3) Subjects & Classes */}
          <section className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold">Subjects & Classes</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <OtherInline
                label="Subjects You Teach"
                value={profile.subjects?.[0] || ""}
                options={toOptions(SUBJECTS)}
                onChange={(v) =>
                  dispatch(setField({ key: "subjects", value: [v] }))
                }
              />
              <OtherInline
                label="Classes You Teach"
                value={profile.classLevels?.[0] || ""}
                options={toOptions(CLASS_LEVELS)}
                onChange={(v) =>
                  dispatch(setField({ key: "classLevels", value: [v] }))
                }
              />
              <OtherInline
                label="Boards / Curriculums"
                value={profile.boards?.[0] || ""}
                options={toOptions(BOARDS)}
                onChange={(v) =>
                  dispatch(setField({ key: "boards", value: [v] }))
                }
              />
              <OtherInline
                label="Exams You Prepare For"
                value={profile.exams?.[0] || ""}
                options={toOptions(EXAMS)}
                onChange={(v) =>
                  dispatch(setField({ key: "exams", value: [v] }))
                }
              />
              <OtherInline
                label="Preferred Student Type"
                value={profile.studentTypes?.[0] || ""}
                options={toOptions(STUDENT_TYPES)}
                onChange={(v) =>
                  dispatch(setField({ key: "studentTypes", value: [v] }))
                }
              />
              <OtherInline
                label="Group Size Preference"
                value={profile.groupSize || ""}
                options={toOptions(GROUP_SIZES)}
                onChange={(v) =>
                  dispatch(setField({ key: "groupSize", value: v }))
                }
              />
            </div>
          </section>

          {/* 4) Rates & Availability */}
          <section className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold">Rates & Availability</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label>Hourly Rate (₹)</Label>
                <Input
                  value={profile.hourlyRate}
                  onChange={(e) =>
                    dispatch(setField({ key: "hourlyRate", value: e.target.value }))
                  }
                  placeholder="e.g., 500"
                  className="h-10"
                />
                {errors.hourlyRate && (
                  <p className="text-rose-600 text-xs mt-1">{errors.hourlyRate}</p>
                )}
              </div>

              <div>
                <Label>Monthly Rate (₹)</Label>
                <Input
                  value={profile.monthlyRate}
                  onChange={(e) =>
                    dispatch(setField({ key: "monthlyRate", value: e.target.value }))
                  }
                  placeholder="e.g., 12000"
                  className="h-10"
                />
              </div>
            </div>

            <Label className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Availability (Select Dates)
            </Label>
            <AvailabilityPicker
              value={(profile.availability as string[]) || []}
              onChange={(next) =>
                dispatch(setField({ key: "availability", value: next }))
              }
            />
          </section>

          {/* 5) About & Highlights */}
          <section className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold">About & Highlights</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Short Bio</Label>
                <Textarea
                  className="min-h-[100px]"
                  value={profile.bio}
                  onChange={(e) =>
                    dispatch(setField({ key: "bio", value: e.target.value }))
                  }
                  placeholder="Describe your teaching style and what makes you effective."
                />
                {errors.bio && <p className="text-rose-600 text-xs mt-1">{errors.bio}</p>}
              </div>

              <div>
                <Label>Teaching Highlights / Achievements</Label>
                <Textarea
                  className="min-h-[80px]"
                  value={profile.achievements}
                  onChange={(e) =>
                    dispatch(setField({ key: "achievements", value: e.target.value }))
                  }
                  placeholder="Awards, certifications, competition results, etc."
                />
              </div>
            </div>
          </section>

          {/* 6) Demo / Introduction Video */}
          <section className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <PlayCircle className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold">Demo / Introduction Video</h2>
            </div>

            <Label>Upload Demo Video (MP4/WebM, up to {MAX_VIDEO_MB}MB)</Label>
            <div
              className="mt-2 flex items-center gap-3 border border-dashed rounded-lg px-4 py-6 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => document.getElementById("demoVideoUpload")?.click()}
            >
              <PlayCircle className="text-primary w-5 h-5" />
              <span className="text-sm text-gray-700">
                {demoVideoFile
                  ? demoVideoFile.name
                  : "Click to upload or drag your video"}
              </span>
            </div>
            <input
              id="demoVideoUpload"
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && onPickDemoVideo(e.target.files[0])
              }
            />

            {demoVideoFile && (
              <div className="mt-4 relative">
                <video
                  controls
                  className="w-full max-h-[420px] rounded-lg border"
                  src={URL.createObjectURL(demoVideoFile)}
                />
                <button
                  type="button"
                  onClick={() => setDemoVideoFile(null)}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-red-100"
                  aria-label="Remove video"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
            {errors.demoVideo && (
              <p className="text-rose-600 text-xs mt-2">{errors.demoVideo}</p>
            )}
          </section>

          {/* 7) Resume (Optional) */}
          <section className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold">Resume (Optional)</h2>
            </div>

            <Label>Upload Resume (PDF/DOC, up to {MAX_RESUME_MB}MB)</Label>
            <div
              className="mt-2 flex items-center gap-3 border border-dashed rounded-lg px-4 py-6 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => document.getElementById("resumeUpload")?.click()}
            >
              <FileText className="text-primary w-5 h-5" />
              <span className="text-sm text-gray-700">
                {resumeFile ? resumeFile.name : "Click to upload or drag your resume"}
              </span>
            </div>
            <input
              id="resumeUpload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && onPickResume(e.target.files[0])
              }
            />

            {resumeFile && (
              <div className="mt-4 flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary w-5 h-5" />
                  <span className="text-sm">{resumeFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResumeFile(null)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <SecondaryButton type="button" onClick={() => router.back()}>
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
