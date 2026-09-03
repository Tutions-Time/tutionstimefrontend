"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Award, GraduationCap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
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
};

function getEducation(tutor: TopTutor) {
  return tutor.qualification || tutor.education || tutor.specialization || "Education details not added";
}

function TutorSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex animate-pulse items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-gray-200" />
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
        setError("Top tutors are loading soon. Please restart the backend so the ranking API is available.");
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
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#9A6A00] shadow-sm">
            <Award className="h-4 w-4" />
            Top tutors
          </div>
          <h2 className="text-3xl font-bold text-gray-950 lg:text-4xl">
            Learn from our highest performing tutors
          </h2>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            A focused look at the top 10 tutors ranked by platform performance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#FFD54F] hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="rounded-full bg-[#FFF7D6] px-3 py-1 text-sm font-bold text-[#9A6A00]">
                    #{index + 1}
                  </div>
                  {tutor.isVerifiedTutor ? (
                    <div className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100 ring-4 ring-[#FFF7D6]">
                    <Image
                      src={getAvatarUrl(tutor.photoUrl)}
                      alt={tutor.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <h3 className="mt-4 line-clamp-1 text-base font-semibold text-gray-950">
                    {tutor.name}
                  </h3>
                  <div className="mt-3 flex min-h-[44px] items-start gap-2 text-sm leading-5 text-gray-600">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-[#9A6A00]" />
                    <span className="line-clamp-2">{getEducation(tutor)}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </motion.div>
    </section>
  );
}
