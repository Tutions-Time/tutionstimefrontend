"use client";

import { useEffect } from "react";

import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";
import OtherInline from "@/components/forms/OtherInline";
import { STATESDISTRICTS } from "@/app/data/StatesDistricts";
import { lookupPincode } from "@/app/data/PincodeMap";
import { getPincodeForCity } from "@/utils/pincodeLookup";

const GENDER = ["Male", "Female", "Other"];
const TEACHING_MODES = ["Online", "Offline", "Both"];
const toOptions = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

export default function TutorPersonalInfoSection({
  photoFile,
  setPhotoFile,
  photoPreview,
  disabled,
}: {
  photoFile: File | null;
  setPhotoFile: (f: File | null) => void;
  photoPreview: string | null;
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  const currentPhotoSrc = photoFile
    ? URL.createObjectURL(photoFile)
    : photoPreview;

const selectedStateObj = STATESDISTRICTS?.states?.find(
  (s) => s.state === profile.state
) ?? null;

  const autofillPincode = (state: string, city: string) => {
    const found = lookupPincode(state, city);
    if (found) {
      dispatch(setField({ key: "pincode", value: found }));
    }
  };

  // Best-effort remote lookup when local map has no hit
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!profile.state || !profile.city) return;
      if (profile.pincode) return; // user already set or local hit
      const pin = await getPincodeForCity(profile.state, profile.city);
      if (!cancelled && pin) {
        dispatch(setField({ key: "pincode", value: pin }));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [dispatch, profile.state, profile.city, profile.pincode]);


  return (
    <section className="bg-white rounded-2xl shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="text-primary w-5 h-5" />
        <h2 className="text-xl font-semibold">Personal Information</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* PHOTO */}
        <div className="flex justify-center md:justify-start">
          <div
            className={`relative ${
              disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"
            }`}
            onClick={() =>
              !disabled && document.getElementById("photoUpload")?.click()
            }
          >
            <div className="h-28 w-28 rounded-full border-2 border-primary overflow-hidden bg-gray-50 shadow">
              {currentPhotoSrc ? (
                <img src={currentPhotoSrc} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-gray-400 mx-auto mt-8" />
              )}
            </div>
          </div>

          <input
            id="photoUpload"
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              setPhotoFile(e.target.files?.[0] || null);
            }}
          />
        </div>

        {/* INFO FIELDS */}
        <div className="md:col-span-2 space-y-5">
          {/* NAME */}
          <div>
            <Input
              disabled={disabled}
              value={profile.name || ""}
              onChange={(e) =>
                dispatch(setField({ key: "name", value: e.target.value }))
              }
              placeholder="Full Name"
            />
          </div>

          {/* EMAIL */}
          <div>
            <Input
              disabled={disabled}
              value={profile.email || ""}
              onChange={(e) =>
                dispatch(setField({ key: "email", value: e.target.value }))
              }
              type="email"
              placeholder="Email"
            />
          </div>

          {/* GENDER + TEACHING MODE */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* GENDER */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <div className="flex gap-2 flex-wrap">
                {GENDER.map((g) => {
                  const selected = profile.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        dispatch(setField({ key: "gender", value: g }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        selected
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-gray-300"
                      } ${disabled ? "opacity-60" : ""}`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TEACHING MODE */}
            <OtherInline
              label="Teaching Mode"
              value={profile.teachingMode}
              options={toOptions(TEACHING_MODES)}
              onChange={(v: string) => {
                dispatch(setField({ key: "teachingMode", value: v }));
              }}
              disabled={disabled}
            />
          </div>

          {/* ADDRESS LINE 1 */}
          <div>
            <Input
              disabled={disabled}
              value={profile.addressLine1 || ""}
              onChange={(e) =>
                dispatch(setField({ key: "addressLine1", value: e.target.value }))
              }
              placeholder="Address Line 1"
            />
          </div>

          {/* ADDRESS LINE 2 */}
          <div>
            <Input
              disabled={disabled}
              value={profile.addressLine2 || ""}
              onChange={(e) =>
                dispatch(setField({ key: "addressLine2", value: e.target.value }))
              }
              placeholder="Address Line 2 (optional)"
            />
          </div>

          {/* CITY / STATE / DISTRICT / PINCODE */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* CITY */}
            {/* <div>
              <Input
                disabled={disabled}
                value={profile.city || ""}
                onChange={(e) =>
                  dispatch(setField({ key: "city", value: e.target.value }))
                }
                onBlur={onValidate}
                placeholder="City"
              />
            </div> */}

            {/* STATE DROPDOWN */}
            <div>
              <select
                disabled={disabled}
                value={profile.state || ""}
                onChange={(e) => {
                  dispatch(setField({ key: "state", value: e.target.value }));
                  dispatch(setField({ key: "city", value: "" })); // reset district
                  dispatch(setField({ key: "pincode", value: "" })); // reset pincode
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
            </div>

            {/* DISTRICT DROPDOWN */}
            <div>
              <select
                disabled={disabled || !profile.state}
                value={profile.city || ""}
                onChange={(e) => {
                  // Reset stale pincode when city changes
                  dispatch(setField({ key: "pincode", value: "" }));
                  dispatch(setField({ key: "city", value: e.target.value }));
                  autofillPincode(profile.state || "", e.target.value);
                }}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">Select District</option>

                {selectedStateObj?.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PINCODE */}
          <div>
            <Input
              disabled={disabled}
              value={profile.pincode || ""}
              onChange={(e) => {
                dispatch(setField({ key: "pincode", value: e.target.value }));
              }}
              placeholder="Pincode"
              inputMode="numeric"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
