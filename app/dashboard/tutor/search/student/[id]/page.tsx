"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  BookOpen,
  GraduationCap,
  Clock,
  User2,
  CalendarDays,
  ArrowLeft,
  Mail,
  Phone,
  School,
  Target,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStudentById } from "@/services/tutorService";
import BookStudentDemoModal from "@/components/tutors/BookStudentDemoModal";
import { Separator } from "@/components/ui/separator";

function Fact({
  icon: Icon,
  label,
  value,
  className
}: {
  icon?: any;
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-1 shrink-0" />}
      <div className="text-sm">
        <div className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</div>
        <div className="font-medium text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-700 border border-primary/20">
      {children}
    </span>
  );
}

const buildUrl = (path?: string | null) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://127.0.0.1:5000";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const [student, setStudent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // The ID from the URL is the user ID (passed from StudentCard)
  const studentUserId = Array.isArray(id) ? id[0] : (id as string);

  useEffect(() => {
    if (studentUserId) {
      setLoading(true);
      fetchStudentById(studentUserId)
        .then((data) => {
          setStudent(data);
        })
        .catch((err) => {
          console.error("Error loading student:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [studentUserId]);

  const imgUrl = useMemo(() => {
    if (!student?.photoUrl) return "/default-avatar.png";
    return buildUrl(student.photoUrl);
  }, [student]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading student details...
      </div>
    );

  if (!student)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Student not found.
      </div>
    );

  // Helper to resolve "Other" fields
  const getField = (main: string, other?: string) => {
    if (main === "Other" && other) return other;
    return main;
  };

  const themePrimary = "#FFD54F";
  const buttonBase =
    "rounded-full px-6 py-2.5 font-semibold text-sm transition-all active:scale-[0.98] shadow-sm";
  const solidPrimary = "bg-[--primary] text-black hover:bg-[#f0c945] hover:shadow";

  // Address construction
  const addressParts = [
    student.addressLine1,
    student.addressLine2,
    student.city,
    student.state,
    student.pincode
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

  // Track Logic
  const track = student.track;

  return (
    <div
      className="min-h-screen bg-gray-50/50 py-6 sm:py-8"
      style={{ ["--primary" as any]: themePrimary }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <div className="p-1 rounded-full group-hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Search
        </button>

        {/* ===== Header ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 md:items-center">
          <div className="shrink-0">
            <Image
              src={imgUrl}
              alt={student.name || "Student"}
              width={120}
              height={120}
              className="rounded-2xl object-cover border-4 border-white shadow-md"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {student.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-gray-600 text-sm">
                {student.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {student.city}, {student.state}
                  </span>
                )}
                {track && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="capitalize font-medium text-primary-700">{track} Student</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                className={`${buttonBase} ${solidPrimary}`}
                onClick={() => setShowModal(true)}
              >
                Book Demo Session
              </button>
            </div>
          </div>
        </div>

        {/* ===== Main Grid ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN - Quick Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Personal Details */}
            <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User2 className="w-4 h-4 text-primary-600" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <Fact icon={User2} label="Gender" value={getField(student.gender, student.genderOther)} />
                {/* <Fact icon={Mail} label="Email" value={student.email || student.userId?.email} />
                <Fact icon={Phone} label="Phone" value={student.userId?.phone} />
                <Fact icon={Phone} label="Alt Phone" value={student.altPhone} /> */}
                <Separator />
                <Fact icon={MapPin} label="Full Address" value={fullAddress} />
              </CardContent>
            </Card>

            {/* Academic Summary */}
            <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary-600" />
                  Academic Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* SCHOOL TRACK */}
                {track === 'school' && (
                  <>
                    <Fact icon={School} label="Board" value={getField(student.board, student.boardOther)} />
                    <Fact icon={GraduationCap} label="Class" value={getField(student.classLevel, student.classLevelOther)} />
                    <Fact icon={BookOpen} label="Stream" value={getField(student.stream, student.streamOther)} />
                  </>
                )}

                {/* COLLEGE TRACK */}
                {track === 'college' && (
                  <>
                    <Fact icon={School} label="Program" value={getField(student.program, student.programOther)} />
                    <Fact icon={BookOpen} label="Discipline" value={getField(student.discipline, student.disciplineOther)} />
                    <Fact icon={CalendarDays} label="Year/Sem" value={getField(student.yearSem, student.yearSemOther)} />
                  </>
                )}

                {/* COMPETITIVE TRACK */}
                {track === 'competitive' && (
                  <>
                    <Fact icon={Target} label="Exam" value={getField(student.exam, student.examOther)} />
                    <Fact icon={CalendarDays} label="Target Year" value={getField(student.targetYear, student.targetYearOther)} />
                  </>
                )}

                {/* FALLBACK / NO TRACK */}
                {!track && (
                  <>
                    <Fact icon={GraduationCap} label="Class Level" value={getField(student.classLevel, student.classLevelOther)} />
                    <Fact icon={School} label="Board" value={getField(student.board, student.boardOther)} />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Detailed Info */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Preferences & Availability */}
            <Card className="rounded-xl border-gray-100 shadow-sm">
              <CardHeader className="pb-4 border-b border-gray-100">
                <CardTitle className="text-base font-semibold">Preferences & Availability</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid sm:grid-cols-2 gap-8">
                
                {/* Subjects */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Subjects of Interest
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {student.subjects?.length ? (
                      student.subjects.map((s: string) => <Chip key={s}>{s}</Chip>)
                    ) : (
                      <span className="text-sm text-gray-400 italic">No subjects listed</span>
                    )}
                    {student.subjectOther && <Chip>{student.subjectOther}</Chip>}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Available Dates
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {student.availability?.length ? (
                      student.availability.map((d: string) => <Chip key={d}>{d}</Chip>)
                    ) : (
                      <span className="text-sm text-gray-400 italic">No specific dates listed</span>
                    )}
                  </div>
                </div>

                {/* Other Prefs */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Preferred Times
                  </h3>
                   <p className="text-sm text-gray-800 font-medium">
                     {student.preferredTimes?.length ? student.preferredTimes.join(", ") : "Flexible"}
                   </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User2 className="w-4 h-4" /> Tutor Gender Preference
                  </h3>
                   <p className="text-sm text-gray-800 font-medium">
                     {getField(student.tutorGenderPref, student.tutorGenderOther) || "No Preference"}
                   </p>
                </div>

              </CardContent>
            </Card>

            {/* Learning Goals */}
            <Card className="rounded-xl border-gray-100 shadow-sm">
              <CardHeader className="pb-4 border-b border-gray-100">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-600" />
                  Learning Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {student.goals || "No specific learning goals mentioned."}
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <BookStudentDemoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        student={{
          ...student,
          userId: student.userId?.id || student.userId
        }}
      />
    </div>
  );
}
