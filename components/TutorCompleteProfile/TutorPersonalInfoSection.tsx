"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";
import OtherInline from "@/components/forms/OtherInline";

const GENDER = ["Male", "Female", "Other"];
const TEACHING_MODES = ["Online", "Offline", "Both"];
const toOptions = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

// 🔗 API URLs
const STATES_API = "https://api.instantpay.in/fi/remit/out/india/stateDistrict/";
const DISTRICTS_API = "https://india-state-district-api.onrender.com/districts";

export default function TutorPersonalInfoSection({
  photoFile,
  setPhotoFile,
  photoPreview,
  errors,
  disabled,
  onValidate,
}: {
  photoFile: File | null;
  setPhotoFile: (f: File | null) => void;
  photoPreview: string | null;
  errors: Record<string, string>;
  disabled?: boolean;
  onValidate?: () => void;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-600 mt-1">{msg}</p> : null;

  const currentPhotoSrc = photoFile
    ? URL.createObjectURL(photoFile)
    : photoPreview;

  // 🌍 States & Districts
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // ⬇️ Load states on mount
  useEffect(() => {
    async function loadStates() {
      try {
        const res = await fetch(STATES_API);
        const data = await res.json();
        setStates(data.states || []);
      } catch (err) {
        console.error("Failed loading states", err);
      }
    }
    loadStates();
  }, []);

  // ⬇️ Load districts when state changes
  useEffect(() => {
    async function loadDistricts() {
      if (!profile.state) {
        setDistricts([]);
        return;
      }

      setLoadingDistricts(true);
      try {
        const res = await fetch(`${DISTRICTS_API}/${profile.state}`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (err) {
        console.error("Failed loading districts", err);
      } finally {
        setLoadingDistricts(false);
      }
    }

    loadDistricts();
  }, [profile.state]);

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
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
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
              onBlur={onValidate}
              placeholder="Full Name"
            />
            <Err msg={errors?.name} />
          </div>

          {/* EMAIL */}
          <div>
            <Input
              disabled={disabled}
              value={profile.email || ""}
              onChange={(e) =>
                dispatch(setField({ key: "email", value: e.target.value }))
              }
              onBlur={onValidate}
              type="email"
              placeholder="Email"
            />
            <Err msg={errors?.email} />
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
                        onValidate?.();
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
              <Err msg={errors?.gender} />
            </div>

            {/* TEACHING MODE */}
            <OtherInline
              label="Teaching Mode"
              value={profile.teachingMode}
              options={toOptions(TEACHING_MODES)}
              onChange={(v: string) => {
                dispatch(setField({ key: "teachingMode", value: v }));
                onValidate?.();
              }}
              disabled={disabled}
            />
            <Err msg={errors?.teachingMode} />
          </div>

          {/* ADDRESS LINE 1 */}
          <div>
            <Input
              disabled={disabled}
              value={profile.addressLine1 || ""}
              onChange={(e) =>
                dispatch(setField({ key: "addressLine1", value: e.target.value }))
              }
              onBlur={onValidate}
              placeholder="Address Line 1"
            />
            <Err msg={errors?.addressLine1} />
          </div>

          {/* ADDRESS LINE 2 */}
          <div>
            <Input
              disabled={disabled}
              value={profile.addressLine2 || ""}
              onChange={(e) =>
                dispatch(setField({ key: "addressLine2", value: e.target.value }))
              }
              onBlur={onValidate}
              placeholder="Address Line 2 (optional)"
            />
          </div>

          {/* CITY / STATE / PINCODE */}
          <div className="grid md:grid-cols-3 gap-4">

            {/* CITY / DISTRICT */}
            <div>
              <select
                disabled={disabled || !profile.state}
                value={profile.city || ""}
                onChange={(e) =>
                  dispatch(setField({ key: "city", value: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">
                  {loadingDistricts ? "Loading districts..." : "Select District"}
                </option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <Err msg={errors?.city} />
            </div>

            {/* STATE */}
            <div>
              <select
                disabled={disabled}
                value={profile.state || ""}
                onChange={(e) => {
                  dispatch(setField({ key: "state", value: e.target.value }));
                  dispatch(setField({ key: "city", value: "" })); // reset district
                }}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Err msg={errors?.state} />
            </div>

            {/* PINCODE */}
            <div>
              <Input
                disabled={disabled}
                value={profile.pincode || ""}
                onChange={(e) =>
                  dispatch(setField({ key: "pincode", value: e.target.value }))
                }
                onBlur={onValidate}
                placeholder="Pincode"
                inputMode="numeric"
              />
              <Err msg={errors?.pincode} />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
