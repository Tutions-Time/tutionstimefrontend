"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Award, BookOpen, Briefcase, ExternalLink, GraduationCap, MapPin, Monitor, ShieldCheck, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fetchTopTutors } from "@/services/studentService";
import { getAvatarUrl } from "@/utils/getImageUrl";
import { fadeInUp, useScrollAnimation } from "./animations";

type TopTutor = {
  _id: string;
  name: string;
  photoUrl?: string;
  qualification?: string;
  education?: string;
  specialization?: string;
  isVerifiedTutor?: boolean;
  experience?: number;
  rating?: number;
  ratingCount?: number;
  completedClassesCount?: number;
  subjects?: string[];
  boards?: string[];
  exams?: string[];
  classLevels?: string[];
  bio?: string;
  teachingMode?: string;
  city?: string;
};

function getEducation(tutor: TopTutor) {
  return tutor.qualification || tutor.education || tutor.specialization || "Education details not added";
}

function TutorSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="flex motion-safe:animate-pulse items-center gap-4">
        <div className="h-24 w-24 shrink-0 rounded-2xl bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-6 h-20 rounded-xl bg-slate-50 motion-safe:animate-pulse" />
      <div className="mt-6 h-12 rounded-full bg-slate-100 motion-safe:animate-pulse" />
    </div>
  );
}

export default function TopTutorsSection() {
  const reducedMotion = useReducedMotion();
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
        setError("We couldn’t load our tutors right now. Please try again shortly.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section ref={ref} aria-labelledby="top-tutors-heading" className="bg-[#F8FAFC] py-14 sm:py-20">
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        variants={fadeInUp}
        initial={reducedMotion ? false : "hidden"}
        animate={isInView || reducedMotion ? "visible" : "hidden"}
      >
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#9A6A00] shadow-sm">
            <Award className="h-4 w-4" />
            Top tutors
          </div>
          <h2 id="top-tutors-heading" className="text-3xl font-bold text-gray-950 lg:text-4xl">
            Learn from our highest performing tutors
          </h2>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            Find your right fit. Explore our tutors, their subjects, and the expertise they bring to every lesson.
          </p>
        </div>

        <div aria-busy={loading} className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => <TutorSkeleton key={index} />)
          ) : tutors.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-950">Top tutors will appear here</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                {error || "Once tutor activity is available, the top 10 list will show here."}
              </p>
            </div>
          ) : (
            tutors.slice(0, 10).map((tutor, index) => (
              <article
                key={tutor._id}
                className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-blue-200 hover:shadow-lg motion-reduce:transition-none sm:p-7"
              >
                <div className="flex items-start gap-3 sm:gap-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-28 sm:w-28">
                    <Image src={getAvatarUrl(tutor.photoUrl)} alt={tutor.name} fill sizes="(max-width: 639px) 80px, 112px" className="object-cover object-center" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <h3 className="flex min-w-0 items-center gap-1.5 text-lg font-bold tracking-tight text-blue-700 sm:text-xl">
                        <span className="break-words">{tutor.name}</span>
                        {tutor.isVerifiedTutor && <ShieldCheck aria-label="Verified tutor" className="h-5 w-5 shrink-0 text-emerald-600" />}
                      </h3>
                      {Number(tutor.ratingCount) > 0 && (
                        <div aria-label={`${tutor.rating} out of 5 from ${tutor.ratingCount} reviews`} className="flex shrink-0 items-center gap-1 text-sm">
                          <Star aria-hidden="true" className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-900">{Number(tutor.rating).toFixed(1)}</span>
                          <span className="text-xs text-slate-500">({tutor.ratingCount})</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 inline-flex max-w-full items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 sm:text-sm">
                      <GraduationCap aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="break-words line-clamp-2">{getEducation(tutor)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 sm:text-sm">
                      {tutor.experience != null && <span className="inline-flex items-center gap-1.5"><Briefcase aria-hidden="true" className="h-4 w-4 shrink-0" />{tutor.experience} {tutor.experience === 1 ? "year" : "years"} experience</span>}
                      {Number(tutor.completedClassesCount) > 0 && <span className="inline-flex items-center gap-1.5"><BookOpen aria-hidden="true" className="h-4 w-4 shrink-0" />{tutor.completedClassesCount} classes taught</span>}
                    </div>
                  </div>
                </div>
                <h4 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-slate-900 sm:text-xl">
                  {tutor.specialization || (tutor.subjects?.length ? `${tutor.subjects.slice(0, 2).join(" & ")} tutor` : "Personalised tutoring")}
                </h4>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  {tutor.teachingMode && <span className="inline-flex items-center gap-1.5"><Monitor aria-hidden="true" className="h-4 w-4" />{tutor.teachingMode === "Both" ? "Online & offline" : tutor.teachingMode}</span>}
                  {tutor.city && <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="h-4 w-4" />{tutor.city}</span>}
                  <span className="ml-auto rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Top {index + 1}</span>
                </div>
                {tutor.bio && <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 sm:text-base">{tutor.bio}</p>}
                <div className="mb-6 mt-5 space-y-3">
                  <TagRow label="Teaches" values={tutor.subjects} />
                  <TagRow label="Curriculum" values={tutor.boards} />
                  <TagRow label="Classes" values={tutor.classLevels} />
                  <TagRow label="Exams" values={tutor.exams} />
                </div>
                <Link href="/login" aria-label={`View ${tutor.name}'s profile`} className="mt-auto inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 motion-reduce:transition-none sm:text-base">
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />View profile
                </Link>
              </article>
            ))
          )}
        </div>
      </motion.div>
    </section>
  );
}

function TagRow({ label, values }: { label: string; values?: string[] }) {
  if (!values?.length) return null;
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span className="w-20 shrink-0 text-slate-500">{label}</span>
      <div className="flex min-w-0 flex-wrap gap-2">
        {values.map((value, index) => <span key={`${value}-${index}`} className="max-w-full break-words rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-slate-700">{value}</span>)}
      </div>
    </div>
  );
}
