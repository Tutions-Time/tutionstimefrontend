"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { CalendarDays, MapPin, User2, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import BookStudentDemoModal from "@/components/tutors/BookStudentDemoModal";

interface StudentCardProps {
  student: any;
  getImageUrl: (photoUrl?: string) => string;
}

export default function StudentCard({ student, getImageUrl }: StudentCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

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
    availability = [],
    photoUrl,
  } = student || {};

  const normalizedSubjects = Array.isArray(subjects)
    ? subjects
    : typeof subjects === "string"
    ? subjects.split(",").map((s) => s.trim())
    : [];

  const location = [city, state].filter(Boolean).join(", ");

  return (
    <>
      <Card className="relative p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all w-full min-w-0">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-2 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border">
            <Image
              src={getImageUrl(photoUrl)}
              alt={name || "Student"}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm text-gray-800 truncate">
              {name}
            </div>

            <div className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
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
          </div>

          {classLevel && (
            <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary text-[10px] border border-primary/20 whitespace-nowrap">
              Class {classLevel}
            </span>
          )}
        </div>

        {/* LOCATION */}
        {(city || state || pincode) && (
          <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-2 truncate">
            <MapPin className="w-3 h-3" />
            <span className="truncate">
              {location} {pincode && `- ${pincode}`}
            </span>
          </div>
        )}

        {/* SUBJECTS */}
        {normalizedSubjects.length > 0 && (
          <div className="flex flex-wrap gap-1 overflow-hidden mb-3">
            {normalizedSubjects.slice(0, 3).map((subj, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full border px-2 py-[2px] text-[10px] text-gray-700 truncate max-w-[120px]"
              >
                {subj}
              </span>
            ))}

            {normalizedSubjects.length > 3 && (
              <span className="text-[10px] text-gray-500">
                +{normalizedSubjects.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* AVAILABILITY */}
        <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-3">
          <CalendarDays className="w-3 h-3" />

          {availability.length > 0 ? (
            <span className="truncate">
              {availability.slice(0, 2).join(", ")}
              {availability.length > 2 && ` +${availability.length - 2} more`}
            </span>
          ) : (
            <span>No availability added</span>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2 min-w-0">
          <Button
            variant="outline"
            onClick={() => router.push(`/tutor/students/${_id}`)}
            className="flex-1 min-w-0 h-8 text-xs rounded-full bg-primary text-black hover:bg-primary hover:text-white"
          >
            View Details
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowModal(true)}
            className="flex-1 min-w-0 h-8 text-xs font-semibold rounded-full border-primary text-black hover:bg-primary hover:text-white"
          >
            Book Demo
          </Button>
        </div>
      </Card>

      <BookStudentDemoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        student={student}
      />
    </>
  );
}
