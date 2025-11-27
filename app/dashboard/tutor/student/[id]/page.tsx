'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getStudentProfileById } from "@/services/studentService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStudentProfileById(params.id);
        setData(res);
      } catch (err) {
        console.log(err);
      }
    };
    load();
  }, [params.id]);

  if (!data) return <p className="p-6">Loading...</p>;

  const { user, profile } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      {/* Back Button */}
      <div
        className="mb-4 flex items-center gap-2 cursor-pointer select-none"
        onClick={() => router.back()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-black font-medium">Back</span>
      </div>

      {/* TOP HEADER – Modern Primary Card */}
      <Card className="p-8 rounded-3xl mb-10 shadow-md bg-primary border border-yellow-300">

        <div className="flex flex-col md:flex-row gap-8 items-center">
          
          {/* Photo */}
          <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-lg bg-white">
            <Image
              src={
                profile.photoUrl?.startsWith("http")
                  ? profile.photoUrl
                  : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${profile.photoUrl}`
              }
              width={200}
              height={200}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold text-black capitalize">
              {profile.name}
            </h1>

            <p className="text-lg text-black/80">
              {profile.classLevel} • {profile.board}
            </p>

            <div className="flex items-center flex-wrap gap-3 mt-3">

              {/* Location Badge */}
              <span className="px-3 py-1 text-sm rounded-full bg-black/10 text-black font-medium">
                📍 {profile.city}, {profile.state}
              </span>

              {/* Gender Pref */}
              <span className="px-3 py-1 text-sm rounded-full bg-white/60 text-black font-medium">
                🎯 {profile.tutorGenderPref}
              </span>

            </div>
          </div>

        </div>
      </Card>

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT – Quick Facts */}
        <Card className="p-6 rounded-2xl shadow-sm border border-gray-200 bg-white">

          <h2 className="font-semibold text-xl mb-4 text-black">Quick Facts</h2>

          <div className="space-y-4 text-gray-800 text-sm">

            <div>
              <p className="font-semibold text-black">Gender</p>
              <p>{profile.gender}</p>
            </div>

            <div>
              <p className="font-semibold text-black">Class Level</p>
              <p>{profile.classLevel}</p>
            </div>

            <div>
              <p className="font-semibold text-black">Board</p>
              <p>{profile.board}</p>
            </div>

            <div>
              <p className="font-semibold text-black">Location</p>
              <p>{profile.city}, {profile.state}</p>
            </div>

            <div>
              <p className="font-semibold text-black">Pincode</p>
              <p>{profile.pincode}</p>
            </div>

            <div>
              <p className="font-semibold text-black">Contact</p>
              <p>{profile.email || "N/A"}</p>
              <p>{user.phone || "N/A"}</p>
            </div>

          </div>
        </Card>

        {/* RIGHT – About Student */}
        <Card className="p-6 rounded-2xl shadow-sm border border-gray-200 bg-white md:col-span-2">

          <h2 className="font-semibold text-xl mb-4 text-black">About Student</h2>

          {/* Goals */}
          <div className="mb-6">
            <p className="text-gray-700">
              {profile.goals || "No goals specified"}
            </p>
          </div>

          {/* Subjects */}
          <div className="mb-8">
            <h3 className="font-semibold text-black mb-2">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {profile.subjects?.map((s: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 text-black rounded-full text-sm shadow-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="font-semibold text-black mb-2">Available Dates</h3>

            <div className="flex flex-wrap gap-2">
              {profile.availability?.map((date: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm shadow-sm"
                >
                  {date}
                </span>
              ))}
            </div>

          </div>

        </Card>

      </div>

    </div>
  );
}
