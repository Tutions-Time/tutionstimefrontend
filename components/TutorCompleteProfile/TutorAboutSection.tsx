"use client";
import { Target } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";

export default function TutorAboutSection({
  disabled = false, // âœ… new prop
}: {
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
        <h2 className="text-xl font-semibold">About</h2>
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
        </div>

      </div>
    </section>
  );
}

