"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, User2, BookOpen } from "lucide-react";
import { useState } from "react";
import BookStudentDemoModal from "@/components/tutors/BookStudentDemoModal";

interface StudentCardProps {
  student: any;
  getImageUrl: (photoUrl?: string) => string;
}

export default function StudentCard({ student, getImageUrl }: StudentCardProps) {
  const router = useRouter();

  // Destructure + include userId
  const {
    _id,
    userId,
    name,
    gender,
    city,
    state,
    pincode,
    board,
    classLevel,
    subjects = [],
    goals,
    availability = [],
    photoUrl,
  } = student || {};

  const [showModal, setShowModal] = useState(false);

  // FIX: Always convert subjects into an array
  const normalizedSubjects = Array.isArray(subjects)
    ? subjects
    : typeof subjects === "string"
    ? subjects.split(",").map((s) => s.trim())
    : [];

  const primaryLocation = [city, state].filter(Boolean).join(", ");
  const shortGoals = goals?.length > 110 ? goals.slice(0, 110) + "..." : goals;

  const handleViewProfile = () => {
    router.push(`/tutor/students/${_id}`);
  };

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">

      {/* Avatar + Basic Info */}
      <div className="flex gap-3 p-3">

        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border bg-gray-100">
            <img
              src={getImageUrl(photoUrl)}
              alt={name || "Student"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {name}
            </h3>

            {classLevel && (
              <span className="px-2 py-0.5 rounded-full bg-primary-50 text-[11px] text-primary-700">
                Class {classLevel}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-gray-600">
            {gender && (
              <span className="inline-flex items-center gap-1">
                <User2 className="w-3 h-3" /> {gender}
              </span>
            )}

            {board && (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {board}
              </span>
            )}
          </div>

          {(city || state || pincode) && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin className="w-3 h-3" />
              {primaryLocation} {pincode && ` - ${pincode}`}
            </div>
          )}
        </div>
      </div>

      {/* Subjects + Goals */}
      <div className="px-3 pb-3 space-y-2">
        {normalizedSubjects.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {normalizedSubjects.slice(0, 4).map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-gray-100 text-[11px] text-gray-700 px-2 py-0.5"
              >
                {s}
              </span>
            ))}

            {normalizedSubjects.length > 4 && (
              <span className="text-[11px] text-gray-500">
                +{normalizedSubjects.length - 4} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400">Subjects not specified.</p>
        )}

        {shortGoals && (
          <p className="text-[11px] text-gray-600 leading-snug">{shortGoals}</p>
        )}
      </div>

      {/* Availability & Actions */}
      <div className="border-t px-3 py-2.5 bg-gray-50">
        <div className="flex items-center gap-2 mb-2 text-[11px] text-gray-600">
          <CalendarDays className="w-3 h-3" />

          {availability?.length ? (
            <span>
              {availability.slice(0, 2).join(", ")}
              {availability.length > 2 &&
                ` +${availability.length - 2} more`}
            </span>
          ) : (
            <span>No availability added</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleViewProfile}
            className="flex-1 border rounded-lg px-3 py-1.5 text-[11px] bg-white"
          >
            View Details
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex-1 rounded-lg bg-primary-600 px-3 py-1.5 text-[11px] text-black font-semibold hover:bg-primary-700"
          >
            Book Demo
          </button>
        </div>
      </div>

      {/* Book Demo Modal */}
      <BookStudentDemoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        student={student}
      />
    </article>
  );
}
