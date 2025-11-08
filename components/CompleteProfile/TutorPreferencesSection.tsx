"use client";

import { Users2, Calendar as CalendarIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/studentProfileSlice";
import { Label } from "@/components/ui/label";
import AvailabilityPicker from "@/components/forms/AvailabilityPicker";
import OtherInline from "@/components/forms/OtherInline";

const TUTOR_GENDER = ["No Preference", "Male", "Female", "Other"] as const;
const toOptions = (arr: readonly string[]) =>
  arr.map((v) => ({ value: v, label: v }));

export default function TutorPreferencesSection({
  disabled = false, // ✅ added prop
}: {
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const onOtherChange =
    (baseKey: string, otherKey: string, options: readonly string[]) =>
    (val: string) => {
      if (disabled) return; // ✅ block changes when disabled

      const isKnown = options.includes(val as any) || val === "";
      if (isKnown) {
        dispatch(setField({ key: baseKey as any, value: val }));
        if (val !== "Other")
          dispatch(setField({ key: otherKey as any, value: "" }));
      } else {
        dispatch(setField({ key: baseKey as any, value: "Other" }));
        dispatch(setField({ key: otherKey as any, value: val }));
      }
    };

  return (
    <div className="bg-white/90 rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur p-8 relative">
      {/* 🔒 Overlay when disabled */}
      {disabled && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-2xl z-10 cursor-not-allowed" />
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Users2 className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Tutor Preferences
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 relative z-20">
        {/* ✅ Preferred Tutor Gender */}
        <OtherInline
          label="Preferred Tutor Gender"
          value={profile.tutorGenderPref}
          options={toOptions(TUTOR_GENDER)}
          placeholder="Select"
          onChange={onOtherChange(
            "tutorGenderPref",
            "tutorGenderOther",
            TUTOR_GENDER
          )}
          hideOtherInput
          disabled={disabled} // ✅ pass disabled to component
        />

        {/* ✅ Availability Picker */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <Label>Availability (Select Dates)</Label>
            </div>
            <span className="text-xs text-gray-500">
              {Array.isArray(profile.availability)
                ? profile.availability.length
                : 0}{" "}
              date(s) selected
            </span>
          </div>

          <AvailabilityPicker
            disabled={disabled} // ✅ this ensures calendar lock
            value={profile.availability as unknown as string[]}
            onChange={(next) =>
              !disabled &&
              dispatch(setField({ key: "availability", value: next }))
            }
          />
        </div>
      </div>
    </div>
  );
}
