"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  User,
  GraduationCap,
  BookOpen,
  Wallet,
  Target,
  Upload,
  FileText,
  PlayCircle, // icon for video section
} from "lucide-react";

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "English", "Computer Science", "Economics", "Accountancy", "History",
];

const CLASS_LEVELS = [
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12", "Undergraduate",
];

const EXPERIENCE_OPTIONS = [
  "Less than 1 year", "1–2 years", "3–5 years", "6–10 years", "10+ years",
];

const QUALIFICATIONS = [
  "B.Sc", "M.Sc", "B.Tech", "M.Tech", "B.A", "M.A", "B.Ed", "M.Ed", "Ph.D",
];

const TEACHING_MODES = ["Online", "Offline", "Both"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Max video size (approx) for local file uploads
const MAX_VIDEO_MB = 100;

export default function TutorProfileCompletePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  /** 🔹 NEW: local file state for demo video uploads */
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill if cached
  useEffect(() => {
    try {
      const cache = localStorage.getItem("tt_tutor_prefill");
      if (cache) dispatch(setBulk(JSON.parse(cache)));
    } catch {}
  }, [dispatch]);

  // Save to localStorage (files are NOT saved locally; we only persist string fields)
  useEffect(() => {
    try {
      localStorage.setItem(
        "tt_tutor_prefill",
        JSON.stringify({ ...profile, isSubmitting: false })
      );
    } catch {}
  }, [profile]);

  // Validation helpers
  const setFieldError = (key: string, err: string) =>
    setErrors((p) => ({ ...p, [key]: err }));

  const validateField = (key: string, value: any) => {
    let err = "";
    switch (key) {
      case "name":
        if (!value.trim()) err = "Name is required";
        break;
      case "email":
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) err = "Valid email required";
        break;
      case "phone":
        if (!value.trim() || value.replace(/\D/g, "").length < 10) err = "Valid phone required";
        break;
      case "pincode":
        if (!value.trim() || value.replace(/\D/g, "").length < 6) err = "Valid pincode required";
        break;
      case "qualification":
        if (!value.trim()) err = "Qualification required";
        break;
      case "experience":
        if (!value.trim()) err = "Experience required";
        break;
      case "subjects":
        if (!value.length) err = "Select at least one subject";
        break;
      case "hourlyRate":
        if (!String(value).trim() || isNaN(Number(value))) err = "Enter valid hourly rate";
        break;
      case "bio":
        if (!String(value).trim()) err = "Bio is required";
        break;
      /** 🔹 special key: demoVideo (requires either file or URL) */
      case "demoVideo":
        if (!demoVideoFile && !profile.demoVideoUrl.trim()) {
          err = "Add a demo video (upload a file or paste a URL)";
        }
        break;
      default:
        break;
    }
    setFieldError(key, err);
    return !err;
  };

  const toggleSubject = (s: string) => {
    const next = profile.subjects.includes(s)
      ? profile.subjects.filter((x) => x !== s)
      : [...profile.subjects, s];
    dispatch(setField({ key: "subjects", value: next }));
    validateField("subjects", next);
  };

  const toggleDay = (d: string) => {
    const next = profile.availableDays.includes(d)
      ? profile.availableDays.filter((x) => x !== d)
      : [...profile.availableDays, d];
    dispatch(setField({ key: "availableDays", value: next }));
  };

  const onPickDemoVideo = (file?: File | null) => {
    const f = file || null;
    if (!f) {
      setDemoVideoFile(null);
      return;
    }
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_MB) {
      setDemoVideoFile(null);
      setFieldError("demoVideo", `Max ${MAX_VIDEO_MB} MB allowed`);
      return;
    }
    setDemoVideoFile(f);
    // If a file is chosen, we can clear URL (optional)
    // dispatch(setField({ key: "demoVideoUrl", value: "" })); // uncomment if you want mutual exclusivity
    // clear any error
    setFieldError("demoVideo", "");
  };

  const handleSubmit = async () => {
    const required = [
      "name", "email", "phone", "pincode", "qualification",
      "experience", "subjects", "hourlyRate", "bio",
      /** 🔹 ensure demo video present */
      "demoVideo",
    ];

    let valid = true;
    required.forEach((k) => {
      const value =
        k === "demoVideo" ? null : (profile as any)[k as keyof typeof profile];
      const ok = validateField(k, value);
      if (!ok) valid = false;
    });
    if (!valid) return;

    try {
      dispatch(startSubmitting());
      const fd = new FormData();
      fd.append("name", profile.name);
      fd.append("email", profile.email);
      fd.append("phone", profile.phone);
      fd.append("gender", profile.gender);
      fd.append("pincode", profile.pincode);
      fd.append("qualification", profile.qualification);
      fd.append("experience", profile.experience);
      fd.append("subjects", JSON.stringify(profile.subjects));
      fd.append("classLevels", JSON.stringify(profile.classLevels));
      fd.append("teachingMode", profile.teachingMode);
      fd.append("hourlyRate", profile.hourlyRate);
      fd.append("monthlyRate", profile.monthlyRate);
      fd.append("availableDays", JSON.stringify(profile.availableDays));
      fd.append("bio", profile.bio);
      fd.append("achievements", profile.achievements);

      if (photoFile) fd.append("photo", photoFile);
      if (certificateFile) fd.append("certificateUrl", certificateFile);

      /** 🔹 DEMO VIDEO: send either file or fallback URL string */
      if (demoVideoFile) {
        fd.append("demoVideo", demoVideoFile);
      } else if (profile.demoVideoUrl.trim()) {
        fd.append("demoVideoUrl", profile.demoVideoUrl.trim());
      }

      await fetch("/api/tutor/profile", { method: "POST", body: fd });
      dispatch(stopSubmitting());
      router.push("/tutor/dashboard");
    } catch (err) {
      console.error(err);
      dispatch(stopSubmitting());
      alert("Something went wrong. Try again later.");
    }
  };

  const disabled = profile.isSubmitting;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-text">
              T
            </div>
            <span className="font-bold text-xl text-text">Tuitions time</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primaryWeak to-white py-10 border-b">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">
            Complete Your Profile
          </h1>
          <p className="text-muted text-base max-w-2xl mx-auto">
            Add your qualifications, experience, and rates to attract the right students.
          </p>
        </div>
      </section>

      {/* Form */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">Personal Information</h2>
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
                      <img src={URL.createObjectURL(photoFile)} className="h-full w-full object-cover" />
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
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => {
                      dispatch(setField({ key: "name", value: e.target.value }));
                      validateField("name", e.target.value);
                    }}
                    placeholder="e.g., your name"
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={profile.email}
                      onChange={(e) => {
                        dispatch(setField({ key: "email", value: e.target.value }));
                        validateField("email", e.target.value);
                      }}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => {
                        dispatch(setField({ key: "phone", value: e.target.value }));
                        validateField("phone", e.target.value);
                      }}
                      placeholder="10-digit number"
                    />
                    {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Gender</Label>
                    <select
                      className="mt-2 w-full border rounded-lg h-10 px-3 bg-background"
                      value={profile.gender}
                      onChange={(e) =>
                        dispatch(setField({ key: "gender", value: e.target.value }))
                      }
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input
                      value={profile.pincode}
                      onChange={(e) => {
                        dispatch(setField({ key: "pincode", value: e.target.value }));
                        validateField("pincode", e.target.value);
                      }}
                      placeholder="e.g., 110001"
                    />
                    {errors.pincode && <p className="text-red-600 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Teaching */}
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">Academic & Teaching Details</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label>Highest Qualification</Label>
                <select
                  className="mt-2 w-full border rounded-lg h-10 px-3 bg-background"
                  value={profile.qualification}
                  onChange={(e) => {
                    dispatch(setField({ key: "qualification", value: e.target.value }));
                    validateField("qualification", e.target.value);
                  }}
                >
                  <option value="">Select</option>
                  {QUALIFICATIONS.map((q) => (
                    <option key={q}>{q}</option>
                  ))}
                </select>
                {errors.qualification && (
                  <p className="text-red-600 text-xs mt-1">{errors.qualification}</p>
                )}
              </div>

              <div>
                <Label>Experience</Label>
                <select
                  className="mt-2 w-full border rounded-lg h-10 px-3 bg-background"
                  value={profile.experience}
                  onChange={(e) => {
                    dispatch(setField({ key: "experience", value: e.target.value }));
                    validateField("experience", e.target.value);
                  }}
                >
                  <option value="">Select</option>
                  {EXPERIENCE_OPTIONS.map((ex) => (
                    <option key={ex}>{ex}</option>
                  ))}
                </select>
                {errors.experience && (
                  <p className="text-red-600 text-xs mt-1">{errors.experience}</p>
                )}
              </div>

              <div>
                <Label>Teaching Mode</Label>
                <select
                  className="mt-2 w-full border rounded-lg h-10 px-3 bg-background"
                  value={profile.teachingMode}
                  onChange={(e) =>
                    dispatch(setField({ key: "teachingMode", value: e.target.value }))
                  }
                >
                  <option value="">Select</option>
                  {TEACHING_MODES.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">Subjects & Classes</h2>
            </div>
            <div className="mb-4">
              <Label>Subjects</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {SUBJECTS.map((s) => (
                  <label
                    key={s}
                    className={cn(
                      "flex items-center justify-center text-sm font-medium rounded-lg border cursor-pointer px-3 py-2 transition-base",
                      profile.subjects.includes(s)
                        ? "bg-primaryWeak border-primary ring-1 ring-primary"
                        : "hover:bg-gray-50 border-gray-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={profile.subjects.includes(s)}
                      onChange={() => toggleSubject(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
              {errors.subjects && (
                <p className="text-red-600 text-xs mt-2">{errors.subjects}</p>
              )}
            </div>
          </div>

          {/* Rates & Availability */}
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">Rates & Availability</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label>Hourly Rate (₹)</Label>
                <Input
                  value={profile.hourlyRate}
                  onChange={(e) => {
                    dispatch(setField({ key: "hourlyRate", value: e.target.value }));
                    validateField("hourlyRate", e.target.value);
                  }}
                  placeholder="e.g., 500"
                />
                {errors.hourlyRate && (
                  <p className="text-red-600 text-xs mt-1">{errors.hourlyRate}</p>
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
                />
              </div>

              <div>
                <Label>Available Days</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-sm",
                        profile.availableDays.includes(d)
                          ? "bg-primaryWeak border-primary"
                          : "border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* About & Achievements */}
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">About & Achievements</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Short Bio</Label>
                <Textarea
                  className="min-h-[100px]"
                  value={profile.bio}
                  onChange={(e) => {
                    dispatch(setField({ key: "bio", value: e.target.value }));
                    validateField("bio", e.target.value);
                  }}
                  placeholder="Describe your teaching style, approach, and what makes you unique."
                />
                {errors.bio && <p className="text-red-600 text-xs mt-1">{errors.bio}</p>}
              </div>
              <div>
                <Label>Teaching Highlights / Achievements</Label>
                <Textarea
                  className="min-h-[80px]"
                  value={profile.achievements}
                  onChange={(e) =>
                    dispatch(setField({ key: "achievements", value: e.target.value }))
                  }
                  placeholder="Certifications, awards, or accomplishments..."
                />
              </div>

              {/* Certificate Upload */}
              <div>
                <Label>Qualification Certificate (optional)</Label>
                <div
                  className="mt-2 flex items-center gap-3 border border-dashed rounded-lg px-4 py-6 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() =>
                    document.getElementById("certificateUpload")?.click()
                  }
                >
                  <FileText className="text-primary w-5 h-5" />
                  <span className="text-sm text-gray-700">
                    {certificateFile
                      ? certificateFile.name
                      : "Click to upload or drag your certificate"}
                  </span>
                </div>
                <input
                  id="certificateUpload"
                  type="file"
                  accept=".pdf,.png,.jpg"
                  className="hidden"
                  onChange={(e) =>
                    setCertificateFile(e.target.files?.[0] || null)
                  }
                />
              </div>
            </div>
          </div>

          {/* 🔹 NEW: Demo Video (Required) */}
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <PlayCircle className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">Demo Teaching Video (required)</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload a file */}
              <div>
                <Label>Upload Video (MP4/WebM, up to {MAX_VIDEO_MB} MB)</Label>
                <div
                  className="mt-2 flex items-center gap-3 border border-dashed rounded-lg px-4 py-6 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => document.getElementById("demoVideoUpload")?.click()}
                >
                  <Upload className="text-primary w-5 h-5" />
                  <span className="text-sm text-gray-700">
                    {demoVideoFile ? demoVideoFile.name : "Click to upload or drag your video"}
                  </span>
                </div>
                <input
                  id="demoVideoUpload"
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  onChange={(e) => onPickDemoVideo(e.target.files?.[0] || null)}
                />

                {/* Inline preview if file selected */}
                {demoVideoFile && (
                  <div className="mt-4">
                    <video
                      className="w-full rounded-lg border"
                      src={URL.createObjectURL(demoVideoFile)}
                      controls
                    />
                  </div>
                )}
              </div>

              {/* OR paste a URL */}
              <div>
                <Label>Or paste a video URL (YouTube/Drive/direct link)</Label>
                <Input
                  className="mt-2"
                  value={profile.demoVideoUrl}
                  onChange={(e) => {
                    dispatch(setField({ key: "demoVideoUrl", value: e.target.value }));
                    // validate presence when typing
                    setFieldError("demoVideo", "");
                  }}
                  placeholder="https://youtu.be/… or https://drive.google.com/…"
                />

                {/* Preview if URL present and no file chosen */}
                {!demoVideoFile && profile.demoVideoUrl && (
                  <p className="text-xs text-muted mt-2">
                    URL will be saved with your profile. For YouTube links, we’ll embed the player on your public profile.
                  </p>
                )}
              </div>
            </div>

            {errors.demoVideo && (
              <p className="text-red-600 text-xs mt-3">{errors.demoVideo}</p>
            )}

            <p className="text-xs text-gray-500 mt-4">
              Tip: Keep the demo 30–120 seconds. Introduce yourself, subjects, class levels, and your teaching approach.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <SecondaryButton type="button" onClick={() => router.back()}>
              Back
            </SecondaryButton>
            <div className="flex items-center gap-3">
              <SecondaryButton
                type="button"
                onClick={() => alert("Progress saved locally")}
              >
                Save Draft
              </SecondaryButton>
              <PrimaryButton type="button" disabled={disabled} onClick={handleSubmit}>
                {disabled ? "Saving…" : "Save & Continue"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
