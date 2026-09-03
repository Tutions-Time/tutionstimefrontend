"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, BookOpen, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fetchTopTutors } from "@/services/studentService";
import { getAvatarUrl } from "@/utils/getImageUrl";
import { fadeInUp, scaleHover, useScrollAnimation } from "./animations";

type TopTutor = {
  _id: string;
  userId?: { _id: string };
  name: string;
  photoUrl?: string;
  city?: string;
  state?: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  hourlyRate?: number;
  subjects?: string[];
  rating?: number;
  ratingCount?: number;
  completedClassesCount?: number;
  completedDemoCount?: number;
  isVerifiedTutor?: boolean;
};

const stars = Array.from({ length: 5 });

function RatingStars({ value }: { value?: number }) {
  const rating = Number.isFinite(value) ? Math.max(0, Math.min(5, Number(value))) : 0;

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} rating`}>
      {stars.map((_, index) => (
        <Star
          key={index}
          className={
            index < Math.round(rating)
              ? "h-3.5 w-3.5 fill-yellow-500 text-yellow-500"
              : "h-3.5 w-3.5 text-gray-300"
          }
        />
      ))}
    </div>
  );
}

function TutorSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex animate-pulse gap-4">
        <div className="h-14 w-14 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function TopTutorsSection() {
  const { ref, isInView } = useScrollAnimation();
  const [tutors, setTutors] = useState<TopTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchTopTutors()
      .then((data) => {
        if (!active) return;
        setTutors(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((loadError) => {
        console.error("Failed to load top tutors", loadError);
        if (!active) return;
        setTutors([]);
        setError("Top tutors are loading soon. Please restart the backend so the new ranking API is available.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section ref={ref} className="bg-[#F8FAFC] py-20">
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#9A6A00] shadow-sm">
              <Award className="h-4 w-4" />
              Top tutors
            </div>
            <h2 className="text-3xl font-bold text-gray-950 lg:text-4xl">
              Learn from our highest performing tutors
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              Ranked using student reviews, completed classes, completed demos,
              and verified profile quality.
            </p>
          </div>

          <Link href="/signup?role=student">
            <motion.div whileHover={scaleHover} whileTap={{ scale: 0.95 }}>
              <Button className="bg-primary font-semibold text-text hover:bg-primary/90">
                Find a Tutor
              </Button>
            </motion.div>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => <TutorSkeleton key={index} />)
          ) : tutors.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-950">Top tutors will appear here</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                {error ||
                  "We rank tutors using reviews, completed classes, completed demos, and verification. Once tutor activity is available, the top 10 list will show here."}
              </p>
            </div>
          ) : (
            tutors.map((tutor, index) => (
              <article
                key={tutor._id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#FFD54F] hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
                      <Image
                        src={getAvatarUrl(tutor.photoUrl)}
                        alt={tutor.name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#9A6A00]">#{index + 1}</div>
                      <h3 className="line-clamp-1 text-base font-semibold text-gray-950">
                        {tutor.name}
                      </h3>
                    </div>
                  </div>
                  {tutor.isVerifiedTutor ? (
                    <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />
                  ) : null}
                </div>

                <p className="line-clamp-2 min-h-[40px] text-sm leading-5 text-gray-600">
                  {tutor.qualification || tutor.specialization || "Experienced tutor"}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <RatingStars value={tutor.rating} />
                    <span className="font-semibold text-gray-900">
                      {Number(tutor.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {tutor.ratingCount || 0} reviews
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#9A6A00]" />
                    <span>{tutor.completedClassesCount || 0} classes completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#9A6A00]" />
                    <span>{tutor.completedDemoCount || 0} demos completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#9A6A00]" />
                    <span className="line-clamp-1">
                      {[tutor.city, tutor.state].filter(Boolean).join(", ") || "Online"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(tutor.subjects || []).slice(0, 2).map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                    >
                      {subject}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/dashboard/student/search/tutor/${tutor._id}?userId=${tutor.userId?._id ?? ""}`}
                  className="mt-5 block"
                >
                  <Button variant="outline" className="h-9 w-full rounded-full text-xs font-semibold">
                    View Profile
                  </Button>
                </Link>
              </article>
            ))
          )}
        </div>
      </motion.div>
    </section>
  );
}
