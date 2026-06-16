"use client";

import { useState } from "react";
import { Users2, Clock, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/studentProfileSlice";
import { Label } from "@/components/ui/label";
import OtherInline from "@/components/forms/OtherInline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { Textarea } from "../ui/textarea";
import {
  HOURLY_RATE_OPTIONS,
  MONTHLY_RATE_OPTIONS,
} from "@/utils/rateOptions";

const TUTOR_GENDER = ["No Preference", "Male", "Female", "Other"] as const;

const toOptions = (arr: readonly string[]) =>
  arr.map((v) => ({ value: v, label: v }));

const parseBudget = (budget?: string) => {
  const hourly = budget?.match(/Hourly:\s*Rs\.(\d+)/i)?.[1] || "";
  const monthly = budget?.match(/Monthly:\s*Rs\.(\d+)/i)?.[1] || "";
  return { hourly, monthly };
};

const buildBudget = (hourly: string, monthly: string) => {
  const parts = [];
  if (hourly) parts.push(`Hourly: Rs.${hourly}`);
  if (monthly) parts.push(`Monthly: Rs.${monthly}`);
  return parts.join("; ");
};

export default function TutorPreferencesSection({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.studentProfile);

  const [timeDrafts, setTimeDrafts] = useState<
    Record<string, { start: Dayjs | null; end: Dayjs | null }>
  >({});
  const [timeError, setTimeError] = useState("");
  const budget = parseBudget(profile.budget);

  const updateBudget = (next: Partial<typeof budget>) => {
    const hourly = next.hourly !== undefined ? next.hourly : next.monthly !== undefined ? "" : budget.hourly;
    const monthly = next.monthly !== undefined ? next.monthly : next.hourly !== undefined ? "" : budget.monthly;
    dispatch(setField({ key: "budget", value: buildBudget(hourly, monthly) }));
  };

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

  const syncSubjectTimeSlots = (
    nextSlots: { subject: string; slots: string[] }[]
  ) => {
    dispatch(setField({ key: "subjectTimeSlots", value: nextSlots }));
    dispatch(
      setField({
        key: "preferredTimes",
        value: Array.from(new Set(nextSlots.flatMap((item) => item.slots))),
      })
    );
  };

  const getSlotsForSubject = (subject: string) =>
    (profile.subjectTimeSlots || []).find((item) => item.subject === subject)
      ?.slots || [];

  const addSlot = (subject: string) => {
    const draft = timeDrafts[subject];
    if (!draft?.start || !draft?.end || disabled) return;
    if (!draft.end.isAfter(draft.start)) {
      setTimeError(`End time must be after start time for ${subject}.`);
      return;
    }

    const slot = `${draft.start.format("hh:mm A")} - ${draft.end.format("hh:mm A")}`;
    const current = profile.subjectTimeSlots || [];
    const existing = current.find((item) => item.subject === subject);
    const nextSlots = existing
      ? current.map((item) =>
          item.subject === subject
            ? { ...item, slots: Array.from(new Set([...item.slots, slot])) }
            : item
        )
      : [...current, { subject, slots: [slot] }];

    syncSubjectTimeSlots(nextSlots);
    setTimeDrafts((prev) => ({
      ...prev,
      [subject]: { start: null, end: null },
    }));
    setTimeError("");
  };

  const removeSlot = (subject: string, slot: string) => {
    if (disabled) return;
    const nextSlots = (profile.subjectTimeSlots || [])
      .map((item) =>
        item.subject === subject
          ? { ...item, slots: item.slots.filter((s) => s !== slot) }
          : item
      )
      .filter((item) => item.slots.length);
    syncSubjectTimeSlots(nextSlots);
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

        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <Label>Subject-wise Preferred Time Slots</Label>
          </div>

          {profile.subjects.length === 0 ? (
            <p className="text-sm text-gray-500">
              Select subjects first to add separate time slots.
            </p>
          ) : (
            <div className="space-y-4">
              {profile.subjects.map((subject) => {
                const draft = timeDrafts[subject] || { start: null, end: null };
                const slots = getSlotsForSubject(subject);
                return (
                  <div
                    key={subject}
                    className="rounded-xl border border-gray-200 bg-gray-50/70 p-4"
                  >
                    <div className="mb-3 text-sm font-semibold text-gray-900">
                      {subject}
                    </div>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                        <MobileTimePicker
                          label="Start Time"
                          value={draft.start}
                          onChange={(value) => {
                            setTimeDrafts((prev) => ({
                              ...prev,
                              [subject]: {
                                start: value,
                                end:
                                  value && draft.end && !draft.end.isAfter(value)
                                    ? null
                                    : draft.end,
                              },
                            }));
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

                        <MobileTimePicker
                          label="End Time"
                          value={draft.end}
                          onChange={(value) => {
                            setTimeDrafts((prev) => ({
                              ...prev,
                              [subject]: { start: draft.start, end: value },
                            }));
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

                        <button
                          type="button"
                          onClick={() => addSlot(subject)}
                          disabled={!draft.start || !draft.end || disabled}
                          className="h-10 px-4 rounded-lg text-sm bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                          Add Slot
                        </button>
                      </div>
                    </LocalizationProvider>

                    {slots.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {slots.map((slot) => (
                          <button
                            key={`${subject}-${slot}`}
                            type="button"
                            onClick={() => removeSlot(subject, slot)}
                            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition"
                            disabled={disabled}
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
                );
              })}
            </div>
          )}
          {timeError && <p className="mt-2 text-xs text-red-600">{timeError}</p>}
        </div>

        <div className="md:col-span-2">
          <Label className="mb-2 block">What is your budget?</Label>
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              disabled={disabled}
              value={budget.hourly}
              onValueChange={(value) => updateBudget({ hourly: value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select hourly budget" />
              </SelectTrigger>
              <SelectContent>
                {HOURLY_RATE_OPTIONS.map((rate) => (
                  <SelectItem key={rate} value={String(rate)}>
                    Rs.{rate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              disabled={disabled}
              value={budget.monthly}
              onValueChange={(value) => updateBudget({ monthly: value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select monthly budget" />
              </SelectTrigger>
              <SelectContent>
                {MONTHLY_RATE_OPTIONS.map((rate) => (
                  <SelectItem key={rate} value={String(rate)}>
                    Rs.{rate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
