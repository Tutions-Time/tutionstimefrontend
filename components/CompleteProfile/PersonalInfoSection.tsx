"use client";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/studentProfileSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import OtherInline from "@/components/forms/OtherInline";
import { getImageUrl } from "@/utils/getImageUrl";
import { cn } from "@/lib/utils";

const GENDER = ["Male", "Female", "Other"] as const;
const toOptions = (arr: readonly string[]) =>
  arr.map((v) => ({ value: v, label: v }));

export default function PersonalInfoSection({
  photoFile,
  setPhotoFile,
  errors,
  disabled = false,
}: {
  photoFile: File | null;
  setPhotoFile: (f: File | null) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const onGenderChange = (val: string) => {
    if (disabled) return;
    dispatch(setField({ key: "gender", value: val }));
    dispatch(setField({ key: "genderOther", value: "" }));
  };

  return (
    <section
      className={cn(
        "bg-white rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.06)] backdrop-blur-md p-10 transition-all",
        disabled && "opacity-80 pointer-events-none"
      )}
    >
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
        {/* -------- Profile Photo -------- */}
        <div className="flex justify-center md:justify-start">
          <label
            htmlFor="photo-upload"
            className={cn(
              "relative h-36 w-36 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-[3px] group",
              disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
            )}
          >
            <div className="h-full w-full rounded-full bg-white overflow-hidden flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.05)] relative">
              <img
                src={
                  photoFile
                    ? URL.createObjectURL(photoFile)
                    : getImageUrl(profile.photoUrl) ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStltpfa69E9JTQOf5ZcyLGR8meBbxMFJxM0w&s"
                }
                alt="Profile"
                className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStltpfa69E9JTQOf5ZcyLGR8meBbxMFJxM0w&s";
                }}
              />
              {!disabled && (
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-40 transition-opacity rounded-full" />
              )}
            </div>
            {!disabled && (
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPhotoFile(file);
                }}
              />
            )}
          </label>
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
              disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
