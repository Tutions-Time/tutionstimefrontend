"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Star,
  BookOpen,
  GraduationCap,
  Video,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  User2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchTutorById } from "@/services/studentService";
import BookDemoModal from "@/components/tutors/BookDemoModal";
import EnquiryModal from "@/components/tutors/EnquiryModal";

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
      <div className="text-xs sm:text-sm">
        <div className="text-gray-500">{label}</div>
        <div className="font-medium text-gray-800">{value || "N/A"}</div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-700 border border-gray-200">
      {children}
    </span>
  );
}

export default function TutorDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  // ✅ this is coming from URL query: ?userId=xxxxx
  const userIdFromQuery = searchParams.get("userId");

  const [tutor, setTutor] = useState<any>(null);
  const [tab, setTab] = useState<"about" | "reviews">("about");
  const [showModal, setShowModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  // This is the tutor profile id from the route
  const routeTutorId = Array.isArray(id) ? id[0] : (id as string);

  // ✅ This is what we will actually send in payload as tutorId
  // Priority: userId from query → fallback to route id
  const tutorIdForPayload = (userIdFromQuery as string) || routeTutorId;

  useEffect(() => {
    if (routeTutorId) {
      fetchTutorById(routeTutorId)
        .then(setTutor)
        .catch((err) => console.error("Error loading tutor:", err));
    }
  }, [routeTutorId]);

  const imgUrl = useMemo(() => {
    if (!tutor?.photoUrl) return "/default-avatar.png";
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}${tutor.photoUrl}`;
  }, [tutor]);

  if (!tutor)
    return (
      <div className="p-10 text-center text-gray-500 text-sm sm:text-base">
        Loading tutor details...
      </div>
    );

  const themePrimary = "#FFD54F";
  const buttonBase =
    "rounded-full px-5 py-1.5 sm:px-6 sm:py-2 font-semibold text-xs sm:text-sm transition active:scale-[0.98]";
  const solidPrimary = "bg-[--primary] text-black hover:bg-[#f0c945]";
  const outlinePrimary =
    "border border-[--primary] text-[--primary] hover:bg-[--primary]/10";

  return (
    <div
      className="min-h-screen bg-gray-50 py-5 sm:py-8"
      style={{ ["--primary" as any]: themePrimary }}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8">
        {/* ===== Header ===== */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
          <div className="flex items-center sm:block gap-3 w-full sm:w-auto">
            <Image
              src={imgUrl}
              alt={tutor.name}
              width={100}
              height={100}
              className="rounded-lg sm:rounded-xl object-cover border border-gray-200"
            />
            <div className="flex-1 sm:hidden">
              <h1 className="text-lg font-semibold text-gray-900">
                {tutor.name}
              </h1>
              <p className="text-sm text-gray-600">
                {tutor.qualification || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-2 sm:space-y-3">
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold text-gray-900">
                {tutor.name}
              </h1>
              {tutor.isKycVerified && (
                <ShieldCheck className="w-5 h-5 text-green-600" />
              )}
            </div>

            <p className="text-gray-600 text-sm sm:text-base">
              {tutor.qualification || "N/A"}{" "}
              {tutor.specialization ? `• ${tutor.specialization}` : ""}
            </p>

            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {tutor.rating
                  ? `${Number(tutor.rating).toFixed(1)} / 5`
                  : "No rating"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {tutor.city || "City not set"}
              </span>
              <span>
                {tutor.experience ? `${tutor.experience} yrs` : "Exp. N/A"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
              <button
                className={`${buttonBase} ${solidPrimary}`}
                onClick={() => setShowModal(true)}
              >
                Book Free Demo
              </button>
              <button
                className={`${buttonBase} ${outlinePrimary}`}
                onClick={() => setShowEnquiryModal(true)}
              >
                Send Enquiry
              </button>
            </div>
          </div>
        </div>

        {/* ===== Main Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-[260px,1fr] gap-5 sm:gap-8">
          {/* LEFT */}
          <aside className="md:sticky md:top-6 h-max">
            <Card className="border-none shadow-sm rounded-xl">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                  Quick Facts
                </h3>
                <div className="space-y-3">
                  <Fact
                    icon={User2}
                    label="Gender"
                    value={tutor.gender || "N/A"}
                  />
                  <Fact
                    icon={GraduationCap}
                    label="Qualification"
                    value={tutor.qualification || "N/A"}
                  />
                  <Fact
                    icon={Clock}
                    label="Preferred Time"
                    value={tutor.preferredTime || "Flexible"}
                  />
                  <Fact
                    icon={MapPin}
                    label="Location"
                    value={[tutor.city, tutor.state].filter(Boolean).join(", ")}
                  />
                  <Fact
                    icon={ShieldCheck}
                    label="Verification"
                    value={
                      tutor.isKycVerified ? "KYC Verified" : "Not Verified"
                    }
                  />
                </div>

                <div className="border-t pt-3 sm:pt-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Contact Info
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{tutor.userId?.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{tutor.userId?.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* RIGHT */}
          <section className="space-y-4 sm:space-y-6">
            <div className="flex bg-white rounded-lg shadow-sm p-1 gap-1 overflow-x-auto no-scrollbar">
              {["about", "reviews"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t as any)}
                  className={`flex-1 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                    tab === t
                      ? "bg-[--primary] text-black shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {t === "about" ? "About Tutor" : "Reviews"}
                </button>
              ))}
            </div>

            {tab === "about" && (
              <Card className="border-none shadow-sm rounded-xl">
                <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      About Tutor
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {tutor.bio || "No bio provided."}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[--primary]" />{" "}
                        Subjects
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects?.length ? (
                          tutor.subjects.map((s: string) => (
                            <Chip key={s}>{s}</Chip>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">
                            No subjects listed.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[--primary]" />{" "}
                        Class Levels
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.classLevels?.length ? (
                          tutor.classLevels.map((c: string) => (
                            <Chip key={c}>{c}</Chip>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">
                            No classes listed.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fees */}
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Fees & Mode
                    </h2>
                    <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-800">
                      <p>
                        <strong>Hourly:</strong> ₹{tutor.hourlyRate || "N/A"}
                      </p>
                      <p>
                        <strong>Monthly:</strong> ₹{tutor.monthlyRate || "N/A"}
                      </p>
                      <p>
                        <strong>Mode:</strong> {tutor.teachingMode || "N/A"}
                      </p>
                    </div>
                  </div>

                  {tutor.demoVideoUrl && (
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Video className="w-4 h-4 text-[--primary]" /> Demo
                        Video
                      </h2>
                      <video
                        controls
                        className="rounded-lg mt-1 w-full max-h-[300px] border border-gray-200"
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${tutor.demoVideoUrl}`}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "reviews" && (
              <Card className="border-none shadow-sm rounded-xl">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    Student Reviews
                  </h2>
                  {tutor.reviews?.length ? (
                    tutor.reviews.map((r: any, i: number) => (
                      <div
                        key={i}
                        className="border-b border-gray-200 pb-3 mb-3"
                      >
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-gray-800 text-sm">
                            {r.rating} / 5
                          </span>
                          <span className="text-xs text-gray-500">
                            – {r.studentName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {r.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No reviews yet.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>

      {/* ✅ Pass tutorIdForPayload (userId) into both modals */}
      <BookDemoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        tutorId={tutorIdForPayload}
        tutorName={tutor.name}
        subjects={tutor.subjects || []}
        availability={tutor.availability || []}
      />
      <EnquiryModal
        open={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        tutorId={tutorIdForPayload}
        tutorName={tutor.name}
      />
    </div>
  );
}
