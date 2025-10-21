"use client";

import { GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
  value: "student" | "tutor" | null;
  onChange: (role: "student" | "tutor") => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={() => onChange("student")}
        className={cn(
          "group relative p-6 rounded-2xl border-2 transition-base",
          "hover:shadow-soft hover:scale-[1.02]",
          value === "student"
            ? "border-primary bg-primaryWeak shadow-soft"
            : "border-border bg-white"
        )}
      >
        <div
          className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-base",
            value === "student"
              ? "bg-primary"
              : "bg-gray-100 group-hover:bg-primaryWeak"
          )}
        >
          <GraduationCap className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">I&apos;m a Student</h3>
        <p className="text-sm text-muted">
          Find expert tutors and learn at your own pace
        </p>
      </button>

      <button
        onClick={() => onChange("tutor")}
        className={cn(
          "group relative p-6 rounded-2xl border-2 transition-base",
          "hover:shadow-soft hover:scale-[1.02]",
          value === "tutor"
            ? "border-primary bg-primaryWeak shadow-soft"
            : "border-border bg-white"
        )}
      >
        <div
          className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-base",
            value === "tutor"
              ? "bg-primary"
              : "bg-gray-100 group-hover:bg-primaryWeak"
          )}
        >
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">I&apos;m a Tutor</h3>
        <p className="text-sm text-muted">
          Share your knowledge and earn by teaching
        </p>
      </button>
    </div>
  );
}
