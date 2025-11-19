"use client";
import { Target } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";

export default function TutorAboutSection({
  errors,
  disabled = false, // ✅ new prop
}: {
  errors: Record<string, string>;
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  return (
    <section
      className={`bg-white rounded-2xl shadow p-8 transition ${
        disabled ? "opacity-80 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-primary w-5 h-5" />
        <h2 className="text-xl font-semibold">About & Highlights</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Short Bio</Label>
          <Textarea
            disabled={disabled}
            className="min-h-[100px]"
            value={profile.bio || ""}
            onChange={(e) =>
              dispatch(setField({ key: "bio", value: e.target.value }))
            }
            placeholder="Describe your teaching style and what makes you effective."
          />
          {errors.bio && (
            <p className="text-rose-600 text-xs mt-1">{errors.bio}</p>
          )}
        </div>

        <div>
          <Label>Teaching Highlights / Achievements</Label>
          <Textarea
            disabled={disabled}
            className="min-h-[80px]"
            value={profile.achievements || ""}
            onChange={(e) =>
              dispatch(setField({ key: "achievements", value: e.target.value }))
            }
            placeholder="Awards, certifications, competition results, etc."
          />
        </div>
      </div>
    </section>
  );
}
