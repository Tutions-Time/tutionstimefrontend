"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, MapPin, Clock3 } from "lucide-react";
import clsx from "clsx";
import React from "react";

type FilterMap = Record<string, string>;

type SortOption = {
  value: string;
  label: string;
};

type TutorListProps = {
  tutors: any[];
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

const SkeletonCard = () => (
  <div className="animate-pulse p-4 rounded-xl bg-white shadow-sm space-y-3">
    <div className="flex gap-3 items-center">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
        <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
      </div>
    </div>
    <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
  </div>
);

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

  return (
    <section className="lg:col-span-9 space-y-4">
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

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : tutors.map((tutor) => (
              <Card
                key={tutor._id}
                className="relative p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                {/* Featured ribbon */}
                {tutor.isFeatured ? (
                  <div className="absolute -top-2 -left-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-1 shadow-sm border border-amber-200">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src={getImageUrl(tutor.photoUrl)}
                    alt={tutor.name || "Tutor"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />

                  <div>
                    <div className="font-medium text-sm text-gray-800">
                      {tutor.name}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {tutor.qualification ||
                        tutor.specialization ||
                        "—"}
                    </div>
                  </div>
                </div>

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

                <ul className="text-[11px] text-gray-600 mb-2 space-y-0.5">
                  {tutor.gender && <li>{tutor.gender}</li>}
                  {tutor.age && <li>Age: {tutor.age} yrs</li>}
                  {tutor.experience && (
                    <li>
                      <span className="inline-flex items-center rounded-full border px-2 py-[2px] text-[10px]">
                        {tutor.experience} yrs experience
                      </span>
                    </li>
                  )}
                  {Array.isArray(tutor.subjects) &&
                    tutor.subjects.length > 0 && (
                      <li>
                        Subjects:{" "}
                        {tutor.subjects.slice(0, 3).join(", ")}
                      </li>
                    )}
                  {tutor.lastLogin && (
                    <li className="flex items-center gap-1">
                      <Clock3 className="w-3 h-3" />
                      Last Login:{" "}
                      {new Date(
                        tutor.lastLogin
                      ).toLocaleDateString()}
                    </li>
                  )}
                  {tutor.addressLine1 && (
                    <li>
                      {tutor.addressLine1}, {tutor.city}
                    </li>
                  )}
                </ul>

                <div className="flex gap-2">
                  <Link
                    href={`search/tutor/${tutor._id}?userId=${
                      tutor.userId?._id ?? ""
                    }`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-8 text-xs rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      View Profile
                    </Button>
                  </Link>

                  <Link
                    href={`/student/demo/${tutor._id}`}
                    className="flex-1"
                  >
                    <button
                      className={clsx(
                        "w-full h-8 text-[11px] font-semibold rounded-full",
                        "bg-gradient-to-b from-white to-primary/10 text-primary",
                        "border border-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.06)]",
                        "hover:from-white hover:to-primary/20 active:scale-[0.99] transition-all"
                      )}
                    >
                      Get Free Demo
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
      </div>

      {mode === "filter" && totalPages > 1 && (
        <div className="flex justify-between items-center pt-2 text-xs">
          <p className="text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="rounded-full h-8 text-xs px-4"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              className="rounded-full h-8 text-xs px-4"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
