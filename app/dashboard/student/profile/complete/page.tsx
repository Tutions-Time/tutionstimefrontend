"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { updateStudentProfile } from "@/store/slices/profileSlice";
import {
  setField,
  setBulk,
  startSubmitting,
  stopSubmitting,
} from "@/store/slices/studentProfileSlice";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  User,
  BookOpen,
  Target,
  GraduationCap,
  Check,
  Upload,
} from "lucide-react";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Sanskrit",
  "History",
  "Geography",
  "Civics",
  "Economics",
  "Computer Science",
  "Accountancy",
];

const CLASS_LEVELS = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Undergraduate",
  "Other",
];

export default function StudentProfileCompletePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill from localStorage
  useEffect(() => {
    try {
      const cache = localStorage.getItem("tt_student_prefill");
      if (cache) dispatch(setBulk(JSON.parse(cache)));
    } catch {}
  }, [dispatch]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "tt_student_prefill",
        JSON.stringify({ ...profile, isSubmitting: false })
      );
    } catch {}
  }, [profile]);

  const toggleSubject = (subj: string) => {
    const next = profile.subjects.includes(subj)
      ? profile.subjects.filter((s) => s !== subj)
      : [...profile.subjects, subj];
    dispatch(setField({ key: "subjects", value: next }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!profile.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
      e.email = "Valid email required";
    if (!profile.phone.trim() || profile.phone.trim().length < 10)
      e.phone = "Valid phone required";
    if (!profile.classLevel) e.classLevel = "Select class level";
    if (!profile.subjects.length) e.subjects = "Pick at least one subject";
    if (!profile.pincode.trim() || profile.pincode.trim().length < 6)
      e.pincode = "Valid pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      dispatch(startSubmitting());
      const fd = new FormData();
      fd.append("name", profile.name);
      fd.append("email", profile.email);
      fd.append("phone", profile.phone);
      fd.append("classLevel", profile.classLevel);
      fd.append("subjects", JSON.stringify(profile.subjects));
      fd.append("goals", profile.goals);
      fd.append("gender", profile.gender);
      fd.append("pincode", profile.pincode);
      if (photoFile) fd.append("photo", photoFile);

      // Import at the top of the file:
      // import { updateStudentProfile } from '@/services/profileService';
      
      const result = await dispatch(updateStudentProfile(fd)).unwrap();
      if (result.success) {
        router.push("/dashboard/student");
      }
      dispatch(stopSubmitting());
      router.push("/dashboard/student");
    } catch (err) {
      console.error(err);
      dispatch(stopSubmitting());
      alert("Something went wrong. Try again later.");
    }
  };

  const disabled = profile.isSubmitting;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* —— Navbar —— */}
      <nav className="border-b sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-text">
              T
            </div>
            <span className="font-bold text-xl text-text">Tuitions time</span>
          </div>
          {/* <Button className="bg-primary hover:bg-primary/90 text-text font-semibold">
            Dashboard
          </Button> */}
        </div>
      </nav>

      {/* —— Hero Section —— */}
      <section className="bg-gradient-to-br from-primaryWeak to-white py-10 border-b">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">
            Complete Your Student Profile
          </h1>
          <p className="text-muted text-base max-w-2xl mx-auto">
            Fill in your basic details, academics and subjects to find the best tutors for you.
          </p>
        </div>
      </section>

      {/* —— Main Content —— */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* ——— Section 1: Personal Info + Photo ——— */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">
                Personal Information
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Photo */}
              <div className="flex justify-center md:justify-start">
                <div
                  className="relative group cursor-pointer"
                  onClick={() =>
                    document.getElementById("photoUpload")?.click()
                  }
                >
                  <div className="h-28 w-28 rounded-full border-2 border-primary flex items-center justify-center overflow-hidden shadow-md transition-all group-hover:shadow-lg group-hover:scale-[1.02] bg-gray-50">
                    {photoFile ? (
                      <img
                        src={URL.createObjectURL(photoFile)}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  {/* Plus icon badge */}
                  <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-primary text-black rounded-full p-1.5 shadow-md border border-white group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                </div>
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setPhotoFile(e.target.files?.[0] || null)
                  }
                />
              </div>

              {/* Form fields */}
              <div className="md:col-span-2 space-y-5">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      dispatch(setField({ key: "name", value: e.target.value }))
                    }
                    placeholder="e.g., Aditi Sharma"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      onChange={(e) =>
                        dispatch(
                          setField({ key: "email", value: e.target.value })
                        )
                      }
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) =>
                        dispatch(
                          setField({ key: "phone", value: e.target.value })
                        )
                      }
                      placeholder="10-digit number"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ——— Section 2: Academic Info ——— */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">
                Academic Details
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="classLevel">Class Level</Label>
                <select
                  id="classLevel"
                  className="mt-2 w-full border rounded-lg h-10 px-3 bg-background"
                  value={profile.classLevel}
                  onChange={(e) =>
                    dispatch(
                      setField({ key: "classLevel", value: e.target.value })
                    )
                  }
                >
                  <option value="">Select</option>
                  {CLASS_LEVELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.classLevel && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.classLevel}
                  </p>
                )}
              </div>

              <div>
                <Label>Gender</Label>
                <select
                  className="mt-2 w-full border rounded-lg h-10 px-3 bg-background"
                  value={profile.gender}
                  onChange={(e) =>
                    dispatch(
                      setField({ key: "gender", value: e.target.value as any })
                    )
                  }
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={profile.pincode}
                  onChange={(e) =>
                    dispatch(
                      setField({ key: "pincode", value: e.target.value })
                    )
                  }
                  placeholder="e.g., 110001"
                />
                {errors.pincode && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.pincode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ——— Section 3: Subjects ——— */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">
                Preferred Subjects
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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

          {/* ——— Section 4: Goals ——— */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold text-text">Learning Goals</h2>
            </div>
            <Textarea
              id="goals"
              className="min-h-[120px]"
              value={profile.goals}
              onChange={(e) =>
                dispatch(setField({ key: "goals", value: e.target.value }))
              }
              placeholder="e.g., Strengthen algebra basics, improve exam strategies..."
            />
          </div>

          {/* —— Buttons —— */}
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

              <PrimaryButton
                type="button"
                disabled={disabled}
                onClick={handleSubmit}
              >
                {disabled ? "Saving…" : "Save & Continue"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
