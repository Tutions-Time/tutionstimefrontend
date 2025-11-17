"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, User2, BookOpen } from "lucide-react";

interface StudentCardProps {
  student: any;
  getImageUrl: (photoUrl?: string) => string;
}

export default function StudentCard({ student, getImageUrl }: StudentCardProps) {
  const router = useRouter();

  const {
    _id,
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

  const shortGoals =
    goals && goals.length > 110 ? goals.slice(0, 110) + "..." : goals;

  const primaryLocation = [city, state].filter(Boolean).join(", ");

  const handleViewProfile = () => {
    // change the route as per your actual details page
    router.push(`/tutor/students/${_id}`);
  };

  const handleBookDemo = () => {
    // TODO: integrate your actual Book Demo flow for tutors
    // e.g. open modal, call API, etc.
    console.log("Book demo with student:", _id);
  };

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
            <img
              src={getImageUrl(photoUrl)}
              alt={name || "Student"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {name || "Unnamed Student"}
            </h3>
            {classLevel && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary-50 text-[11px] font-medium text-primary-700">
                Class {classLevel}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-gray-600">
            {gender && (
              <span className="inline-flex items-center gap-1">
                <User2 className="w-3 h-3" />
                {gender}
              </span>
            )}
            {board && (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {board}
              </span>
            )}
          </div>

          {primaryLocation || pincode ? (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">
                {primaryLocation}
                {pincode ? ` - ${pincode}` : ""}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Subjects & Goals */}
      <div className="px-3 pb-3 space-y-2">
        {subjects?.length ? (
          <div className="flex flex-wrap gap-1">
            {subjects.slice(0, 4).map((sub: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-gray-100 text-[11px] text-gray-700 px-2 py-0.5"
              >
                {sub}
              </span>
            ))}
            {subjects.length > 4 && (
              <span className="text-[11px] text-gray-500">
                +{subjects.length - 4} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400">
            Subjects not specified.
          </p>
        )}

        {shortGoals && (
          <p className="text-[11px] text-gray-600 leading-snug">
            {shortGoals}
          </p>
        )}
      </div>

      {/* Availability & Actions */}
      <div className="mt-auto border-t border-gray-100 px-3 py-2.5 bg-gray-50">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
            <CalendarDays className="w-3 h-3" />
            {availability && availability.length > 0 ? (
              <span className="truncate">
                {availability.slice(0, 2).join(", ")}
                {availability.length > 2 &&
                  ` +${availability.length - 2} more`}
              </span>
            ) : (
              <span>No availability added</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleViewProfile}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-800 hover:bg-gray-50 transition"
          >
            View Details
          </button>
          <button
            onClick={handleBookDemo}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary-700 transition"
          >
            Book Demo
          </button>
        </div>
      </div>
    </article>
  );
}
