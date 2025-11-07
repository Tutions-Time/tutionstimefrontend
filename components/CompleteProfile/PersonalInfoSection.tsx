"use client";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/studentProfileSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Camera } from "lucide-react";
import OtherInline from "@/components/forms/OtherInline";

const GENDER = ["Male", "Female", "Other"] as const;
const toOptions = (arr: readonly string[]) =>
  arr.map((v) => ({ value: v, label: v }));

export default function PersonalInfoSection({
  photoFile,
  setPhotoFile,
  errors,
}: {
  photoFile: File | null;
  setPhotoFile: (f: File | null) => void;
  errors: Record<string, string>;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const onGenderChange = (val: string) => {
    dispatch(setField({ key: "gender", value: val }));
    dispatch(setField({ key: "genderOther", value: "" }));
  };

  return (
    <div className="bg-white rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.06)] backdrop-blur-md p-10 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <User className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Personal Information
        </h2>
      </div>

      {/* Avatar + Form */}
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-10">
        {/* -------- Profile Photo (Top Left) -------- */}
        <div className="flex justify-center md:justify-start">
          <button
            type="button"
            className="relative group focus:outline-none"
            onClick={() => document.getElementById("photoUpload")?.click()}
          >
            <div className="relative h-36 w-36 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-[3px] transition-transform duration-300 hover:scale-[1.04]">
              <div className="h-full w-full rounded-full bg-white overflow-hidden flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
                {photoFile ? (
                  <img
                    src={URL.createObjectURL(photoFile)}
                    alt="Profile"
                    className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-90"
                  />
                ) : profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt="Profile"
                    className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-90"
                  />
                ) : (
                  <User className="w-14 h-14 text-gray-300" />
                )}

                {/* Floating camera icon */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-full h-10 w-10 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-4.5 h-4.5 text-primary" />
                </div>
              </div>
            </div>
          </button>

          <input
            id="photoUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* -------- Form Fields -------- */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) =>
                dispatch(setField({ key: "name", value: e.target.value }))
              }
              placeholder="e.g., Aditi Sharma"
              className="h-10"
            />
            {errors.name && (
              <p className="text-rose-600 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email + Alternate */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                onChange={(e) =>
                  dispatch(setField({ key: "email", value: e.target.value }))
                }
                placeholder="you@example.com"
                className="h-10"
              />
              {errors.email && (
                <p className="text-rose-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="altPhone">Alternate Number (optional)</Label>
              <Input
                id="altPhone"
                value={profile.altPhone}
                onChange={(e) =>
                  dispatch(setField({ key: "altPhone", value: e.target.value }))
                }
                placeholder="Alternate contact number"
                className="h-10"
              />
            </div>
          </div>

          {/* Address Lines */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={profile.addressLine1}
                onChange={(e) =>
                  dispatch(
                    setField({ key: "addressLine1", value: e.target.value })
                  )
                }
                placeholder="House / Street"
                className="h-10"
              />
              {errors.addressLine1 && (
                <p className="text-rose-600 text-xs mt-1">
                  {errors.addressLine1}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
              <Input
                id="addressLine2"
                value={profile.addressLine2}
                onChange={(e) =>
                  dispatch(
                    setField({ key: "addressLine2", value: e.target.value })
                  )
                }
                placeholder="Area / Landmark"
                className="h-10"
              />
            </div>
          </div>

          {/* City / State / Pincode */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) =>
                  dispatch(setField({ key: "city", value: e.target.value }))
                }
                className="h-10"
              />
              {errors.city && (
                <p className="text-rose-600 text-xs mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={profile.state}
                onChange={(e) =>
                  dispatch(setField({ key: "state", value: e.target.value }))
                }
                className="h-10"
              />
              {errors.state && (
                <p className="text-rose-600 text-xs mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={profile.pincode}
                onChange={(e) =>
                  dispatch(setField({ key: "pincode", value: e.target.value }))
                }
                placeholder="e.g., 110001"
                className="h-10"
              />
              {errors.pincode && (
                <p className="text-rose-600 text-xs mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="grid md:grid-cols-2 gap-4">
            <OtherInline
              label="Gender"
              value={profile.gender}
              options={toOptions(GENDER)}
              placeholder="Select"
              onChange={onGenderChange}
              hideOtherInput
            />
          </div>
        </div>
      </div>
    </div>
  );
}
