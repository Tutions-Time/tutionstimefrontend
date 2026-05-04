"use client";

import { useState } from "react";
import { Users2, Clock, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/studentProfileSlice";
import { Label } from "@/components/ui/label";
import OtherInline from "@/components/forms/OtherInline";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";

const TUTOR_GENDER = ["No Preference", "Male", "Female", "Other"] as const;

const toOptions = (arr: readonly string[]) =>
  arr.map((v) => ({ value: v, label: v }));

export default function TutorPreferencesSection({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [timeError, setTimeError] = useState("");

  const onOtherChange =
    (baseKey: string, otherKey: string, options: readonly string[]) =>
    (val: string) => {
      if (disabled) return;

      const isKnown = options.includes(val as any) || val === "";
      if (isKnown) {
        dispatch(setField({ key: baseKey as any, value: val }));
        if (val !== "Other") {
          dispatch(setField({ key: otherKey as any, value: "" }));
        }
      } else {
        dispatch(setField({ key: baseKey as any, value: "Other" }));
        dispatch(setField({ key: otherKey as any, value: val }));
      }
    };

  const addSlot = () => {
    if (!startTime || !endTime || disabled) return;
    if (!endTime.isAfter(startTime)) {
      setTimeError("End time must be after start time.");
      return;
    }

    const slot = `${startTime.format("hh:mm A")} - ${endTime.format("hh:mm A")}`;
    const next = new Set(profile.preferredTimes || []);
    next.add(slot);

    dispatch(setField({ key: "preferredTimes", value: Array.from(next) }));
    setStartTime(null);
    setEndTime(null);
    setTimeError("");
  };

  return (
    <div className="bg-white/90 rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur p-8 relative">
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
          disabled={disabled}
        />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <Label>Preferred Time Slots</Label>
          </div>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="grid grid-cols-2 gap-3">
              <MobileTimePicker
                label="Start Time"
                value={startTime}
                onChange={(value) => {
                  setStartTime(value);
                  setTimeError("");
                  if (value && endTime && !endTime.isAfter(value)) {
                    setEndTime(null);
                  }
                }}
                ampm
                minutesStep={1}
                disabled={disabled}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    inputProps: { readOnly: true },
                  },
                }}
              />

              <MobileTimePicker
                label="End Time"
                value={endTime}
                onChange={(value) => {
                  setEndTime(value);
                  setTimeError("");
                }}
                ampm
                minutesStep={1}
                disabled={disabled}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    inputProps: { readOnly: true },
                  },
                }}
              />
            </div>
          </LocalizationProvider>

          <button
            type="button"
            onClick={addSlot}
            disabled={!startTime || !endTime || disabled}
            className="mt-3 px-4 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
          >
            Add Slot
          </button>
          {timeError && <p className="mt-2 text-xs text-red-600">{timeError}</p>}

          {(profile.preferredTimes || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(profile.preferredTimes || []).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    if (disabled) return;
                    dispatch(
                      setField({
                        key: "preferredTimes",
                        value: profile.preferredTimes.filter((s) => s !== slot),
                      })
                    );
                  }}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition"
                >
                  {slot}
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 group-hover:bg-primary/30">
                    <X className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <Label className="mb-2 block">What is your budget?</Label>
          <Input
            placeholder="e.g. Rs.500 per hour or Rs.6000 per month"
            value={profile.budget || ""}
            onChange={(e) =>
              dispatch(setField({ key: "budget", value: e.target.value }))
            }
            disabled={disabled}
            className="h-10"
          />
        </div>

        <div className="md:col-span-2">
          <Label className="mb-2 block">Learning Goals (Optional)</Label>
          <Textarea
            placeholder="e.g. I want to prepare for JEE Mains, or I need help with Calculus..."
            value={profile.goals || ""}
            onChange={(e) =>
              dispatch(setField({ key: "goals", value: e.target.value }))
            }
            disabled={disabled}
            className="h-24 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
