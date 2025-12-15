"use client";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/studentProfileSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import OtherInline from "@/components/forms/OtherInline";
import { getImageUrl } from "@/utils/getImageUrl";
import { cn } from "@/lib/utils";
import { STATESDISTRICTS } from "@/app/data/StatesDistricts";

import type { StudentProfileErrors } from "@/utils/validators";

const GENDER = ["Male", "Female", "Other"] as const;

export default function PersonalInfoSection({
  photoFile,
  setPhotoFile,
  errors,
  disabled = false,
  onValidate,
}: {
  photoFile: File | null;
  setPhotoFile: (f: File | null) => void;
  errors: StudentProfileErrors;
  disabled?: boolean;
  onValidate?: () => void;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const selectedStateObj = STATESDISTRICTS.states.find(
    (s) => s.state === profile.state
  );

  const onGenderChange = (val: string) => {
    if (disabled) return;
    dispatch(setField({ key: "gender", value: val }));
    onValidate?.();
  };

  const handlePhoneChange = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 10) v = v.slice(0, 10);
    dispatch(setField({ key: "altPhone", value: v }));
  };

  return (
    <section
      className={cn(
        "bg-white rounded-2xl border shadow p-10 transition-all",
        disabled && "opacity-80 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <User className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold">Personal Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-10">
        {/* PHOTO */}
        <div className="flex justify-center md:justify-start">
          <label
            htmlFor="photo-upload"
            className={cn(
              "relative h-36 w-36 rounded-full cursor-pointer group",
              disabled && "cursor-not-allowed opacity-70"
            )}
          >
            <div className="h-full w-full rounded-full overflow-hidden shadow relative">
              <img
                src={
                  photoFile
                    ? URL.createObjectURL(photoFile)
                    : getImageUrl(profile.photoUrl)
                }
                alt="Profile"
                className="h-full w-full object-cover"
              />
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

        {/* FORM FIELDS */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <Label>Full Name</Label>
            <Input
              value={profile.name}
              onChange={(e) =>
                dispatch(setField({ key: "name", value: e.target.value }))
              }
              onBlur={onValidate}
              disabled={disabled}
            />
            {errors.name && <p className="text-red-600 text-xs">{errors.name}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                value={profile.email}
                onChange={(e) =>
                  dispatch(setField({ key: "email", value: e.target.value }))
                }
                onBlur={onValidate}
                disabled={disabled}
              />
              {errors.email && <p className="text-red-600 text-xs">{errors.email}</p>}
            </div>

            <div>
              <Label>Alternate Phone</Label>
              <Input
                value={profile.altPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={onValidate}
                maxLength={10}
                disabled={disabled}
              />
              {errors.phone && <p className="text-red-600 text-xs">{errors.phone}</p>}
            </div>
          </div>

          {/* Address Line 1 */}
          <div>
            <Label>Address Line 1</Label>
            <Input
              value={profile.addressLine1}
              onChange={(e) =>
                dispatch(setField({ key: "addressLine1", value: e.target.value }))
              }
              onBlur={onValidate}
              disabled={disabled}
            />
            {errors.addressLine1 && (
              <p className="text-red-600 text-xs">{errors.addressLine1}</p>
            )}
          </div>

          {/* City / State / Pincode */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* City (district dropdown) */}
            <div>
              <Label>City</Label>
              <select
                disabled={disabled || !profile.state}
                value={profile.city}
                onChange={(e) => {
                  dispatch(setField({ key: "city", value: e.target.value }));
                  onValidate?.();
                }}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">Select City</option>

                {selectedStateObj?.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {errors.city && <p className="text-red-600 text-xs">{errors.city}</p>}
            </div>

            {/* State */}
            <div>
              <Label>State</Label>
              <select
                disabled={disabled}
                value={profile.state}
                onChange={(e) => {
                  dispatch(setField({ key: "state", value: e.target.value }));
                  dispatch(setField({ key: "city", value: "" })); // reset city
                  onValidate?.();
                }}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">Select State</option>
                {STATESDISTRICTS.states.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>

              {errors.state && <p className="text-red-600 text-xs">{errors.state}</p>}
            </div>

            {/* Pincode */}
            <div>
              <Label>Pincode</Label> 
              <Input
                value={profile.pincode}
                onChange={(e) =>
                  dispatch(setField({ key: "pincode", value: e.target.value }))
                }
                onBlur={onValidate}
                disabled={disabled}
              />
              {errors.pincode && (
                <p className="text-red-600 text-xs">{errors.pincode}</p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div>
            <OtherInline
              label="Gender"
              value={profile.gender}
              options={GENDER.map((v) => ({ value: v, label: v }))}
              onChange={onGenderChange}
              disabled={disabled}
            />
            {errors.gender && (
              <p className="text-red-600 text-xs">{errors.gender}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
