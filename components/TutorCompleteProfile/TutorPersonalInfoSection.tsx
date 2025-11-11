"use client";
import { User, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";
import OtherInline from "@/components/forms/OtherInline";

const GENDER = ["Male", "Female", "Other"];
const TEACHING_MODES = ["Online", "Offline", "Both"];
const toOptions = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

export default function TutorPersonalInfoSection({
  photoFile,
  setPhotoFile,
  photoPreview, // ✅ new prop from parent
  errors,
}: any) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-600 mt-1">{msg}</p> : null;

  // ✅ show file preview if uploaded, otherwise use photoPreview URL from API
  const currentPhotoSrc = photoFile
    ? URL.createObjectURL(photoFile)
    : photoPreview || null;
    console.log("🖼️ currentPhotoSrc =>", currentPhotoSrc);

  return (
    <section className="bg-white rounded-2xl shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="text-primary w-5 h-5" />
        <h2 className="text-xl font-semibold">Personal Information</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* ---------------------- Photo Upload ---------------------- */}
        <div className="flex justify-center md:justify-start">
          <div className="relative group cursor-pointer">
            <div
              className="h-28 w-28 rounded-full border-2 border-primary flex items-center justify-center overflow-hidden shadow-md bg-gray-50"
              onClick={() => document.getElementById("photoUpload")?.click()}
            >
              {currentPhotoSrc ? (
                <img
                  src={currentPhotoSrc}
                  alt="Tutor photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>

            {/* 🗑 remove photo button */}
            {currentPhotoSrc && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoFile(null);
                }}
                className="absolute top-0 right-0 bg-white/80 p-1 rounded-full hover:bg-red-100"
              >
              
              </button>
            )}
          </div>

          <input
            id="photoUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* ---------------------- Info Fields ---------------------- */}
        <div className="md:col-span-2 space-y-5">
          {/* Name */}
          <div>
            <Input
              value={profile.name || ""}
              onChange={(e) =>
                dispatch(setField({ key: "name", value: e.target.value }))
              }
              placeholder="Full Name"
              className="h-10"
            />
            <Err msg={errors?.name} />
          </div>

          {/* Email */}
          <div>
            <Input
              value={profile.email || ""}
              onChange={(e) =>
                dispatch(setField({ key: "email", value: e.target.value }))
              }
              placeholder="Email"
              className="h-10"
              type="email"
            />
            <Err msg={errors?.email} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <div className="flex flex-wrap gap-2">
                {GENDER.map((g) => {
                  const selected = profile.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        dispatch(setField({ key: "gender", value: g }))
                      }
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        selected
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Teaching Mode */}
            <OtherInline
              label="Teaching Mode"
              value={profile.teachingMode}
              options={toOptions(TEACHING_MODES)}
              onChange={(v: string) =>
                dispatch(setField({ key: "teachingMode", value: v }))
              }
            />
          </div>

          {/* Address */}
          <div>
            <Input
              value={profile.addressLine1 || ""}
              onChange={(e) =>
                dispatch(setField({ key: "addressLine1", value: e.target.value }))
              }
              placeholder="Address Line 1"
              className="h-10"
            />
            <Err msg={errors?.addressLine1} />
          </div>

          <div>
            <Input
              value={profile.addressLine2 || ""}
              onChange={(e) =>
                dispatch(setField({ key: "addressLine2", value: e.target.value }))
              }
              placeholder="Address Line 2 (optional)"
              className="h-10"
            />
            <Err msg={errors?.addressLine2} />
          </div>

          {/* City/State/Pincode */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Input
                value={profile.city || ""}
                onChange={(e) =>
                  dispatch(setField({ key: "city", value: e.target.value }))
                }
                placeholder="City"
                className="h-10"
              />
              <Err msg={errors?.city} />
            </div>
            <div>
              <Input
                value={profile.state || ""}
                onChange={(e) =>
                  dispatch(setField({ key: "state", value: e.target.value }))
                }
                placeholder="State"
                className="h-10"
              />
              <Err msg={errors?.state} />
            </div>
            <div>
              <Input
                value={profile.pincode || ""}
                onChange={(e) =>
                  dispatch(setField({ key: "pincode", value: e.target.value }))
                }
                placeholder="Pincode"
                className="h-10"
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
