"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookDemoModal from "@/components/tutors/BookDemoModal";
import { Sparkles, Star, MapPin, Clock3 } from "lucide-react";

// ---------- TYPES ----------
type Tutor = {
  _id: string;
  name: string;
  qualification?: string;
  specialization?: string;
  photoUrl?: string;
  rating?: number;
  city?: string;
  pincode?: string;
  hourlyRate?: number;
  gender?: string;
  age?: number;
  subjects?: string[];
  experience?: number;
  availability?: string[];
  lastLogin?: string;
  addressLine1?: string;
  isFeatured?: boolean;
  userId?: { _id: string };
};

type FilterMap = Record<string, string>;

type SortOption = {
  value: string;
  label: string;
};

type TutorListProps = {
  tutors: Tutor[];
  loading: boolean;
  mode: string;
  total: number;
  filter: FilterMap;
  setFilter: React.Dispatch<React.SetStateAction<FilterMap>>;
  totalPages: number;
  onPageChange: (page: number) => void;
  sortOptions: SortOption[];
  getImageUrl: (photoUrl?: string) => string;
};

// ---------- COMPONENT ----------
export default function TutorList({
  tutors,
  loading,
  mode,
  total,
  filter,
  setFilter,
  totalPages,
  onPageChange,
  sortOptions,
  getImageUrl,
}: TutorListProps) {
  const currentPage = Number(filter.page || "1");

  // Modal States
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  return (
    <section className="lg:col-span-9 space-y-4">
      {/* Sorting Row */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>
          {mode === "filter"
            ? `Showing ${tutors.length} of ${total} tutors`
            : "Recommended tutors for you"}
        </div>

        <div className="flex items-center gap-2">
          <span>Sort</span>
          <select
            value={filter.sort}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                sort: e.target.value,
                page: "1",
              }))
            }
            className="border rounded-full h-8 px-3 text-xs border-gray-200 focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {loading
          ? [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse p-4 rounded-xl bg-white shadow-sm space-y-3"
            >
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          ))
          : tutors.map((tutor) => (
            <Card
              key={tutor._id}
              className="relative p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              {/* FEATURED Label */}
              {tutor.isFeatured && (
                <div className="absolute -top-2 -left-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-1 shadow-sm border border-amber-200">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                </div>
              )}

              {/* PROFILE */}
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src={getImageUrl(tutor.photoUrl)}
                  alt={tutor.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />

                <div>
                  <div className="font-medium text-sm text-gray-800">{tutor.name}</div>
                  <div className="text-[11px] text-gray-500">
                    {tutor.qualification || tutor.specialization || "—"}
                  </div>
                </div>
              </div>

              {/* RATING / LOCATION / PRICE */}
              <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500" />
                  {tutor.rating || "—"}
                </div>

                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {tutor.city || tutor.pincode || "N/A"}
                </div>

                <div className="font-semibold text-primary">
                  ₹{tutor.hourlyRate || 0}/hr
                </div>
              </div>

              {/* ▼▼ RESTORED FULL DETAILS ▼▼ */}
              <ul className="text-[11px] text-gray-600 mb-2 space-y-0.5">
                {tutor.gender && <li>{tutor.gender}</li>}

                {tutor.experience && (
                  <li>
                    <span className="inline-flex items-center rounded-full border px-2 py-[2px] text-[10px]">
                      {tutor.experience} yrs experience
                    </span>
                  </li>
                )}

                {Array.isArray(tutor.subjects) && tutor.subjects.length > 0 && (
                  <li>
                    Subjects: {tutor.subjects.slice(0, 3).join(", ")}
                  </li>
                )}

                {tutor.lastLogin && (
                  <li className="flex items-center gap-1">
                    <Clock3 className="w-3 h-3" />
                    Last Login:{" "}
                    {new Date(tutor.lastLogin).toLocaleDateString("en-IN")}
                  </li>
                )}

                {tutor.addressLine1 && (
                  <li>
                    {tutor.addressLine1}, {tutor.city}
                  </li>
                )}
              </ul>
              {/* ▲▲ RESTORED FULL DETAILS ▲▲ */}

              {/* BUTTONS */}
              <div className="flex gap-2 mt-3">
                {/* VIEW PROFILE */}
                <Link
                  href={`search/tutor/${tutor._id}?userId=${tutor.userId?._id ?? ""}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full h-8 text-xs rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    View Profile
                  </Button>
                </Link>

                {/* DEMO BUTTON (Open Modal) */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTutor(tutor);
                    setDemoModalOpen(true);
                  }}
                  className={clsx(
                    "flex-1 h-8 text-[11px] font-semibold rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                  )}
                >
                  Get Free Demo
                </Button>
              </div>
            </Card>

          ))}
      </div>

      {/* DEMO BOOKING MODAL */}
      {selectedTutor && (
        <BookDemoModal
          open={demoModalOpen}
          onClose={() => setDemoModalOpen(false)}
          tutorId={selectedTutor.userId?._id ?? ""}
          tutorName={selectedTutor.name}
          subjects={selectedTutor.subjects || []}
          availability={selectedTutor.availability || []}
        />
      )}
    </section>
  );
}
