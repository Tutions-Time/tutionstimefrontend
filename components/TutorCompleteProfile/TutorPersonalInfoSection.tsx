"use client";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";
import OtherInline from "@/components/forms/OtherInline";

const GENDER = ["Male", "Female", "Other"];
const TEACHING_MODES = ["Online", "Offline", "Both"];
const toOptions = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

export default function TutorPersonalInfoSection({ photoFile, setPhotoFile, errors }: any) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  return (
    <section className="bg-white rounded-2xl shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="text-primary w-5 h-5" />
        <h2 className="text-xl font-semibold">Personal Information</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
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

        <div className="md:col-span-2 space-y-5">
          <Input
            value={profile.name}
            onChange={(e) => dispatch(setField({ key: "name", value: e.target.value }))}
            placeholder="Full Name"
            className="h-10"
          />
          <Input
            value={profile.email}
            onChange={(e) => dispatch(setField({ key: "email", value: e.target.value }))}
            placeholder="Email"
            className="h-10"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <OtherInline
              label="Gender"
              value={profile.gender}
              options={toOptions(GENDER)}
              onChange={(v) => dispatch(setField({ key: "gender", value: v }))}
            />
            <OtherInline
              label="Teaching Mode"
              value={profile.teachingMode}
              options={toOptions(TEACHING_MODES)}
              onChange={(v) => dispatch(setField({ key: "teachingMode", value: v }))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
