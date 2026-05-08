import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Home,
  Laptop,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Services - Online and Offline Tutoring | TuitionsTime",
  description:
    "Explore TuitionsTime services including online tutoring, offline home tuition, demo classes, verified tutors, flexible schedules, and personalized academic support.",
  alternates: {
    canonical: "https://tuitionstime.com/services",
  },
  openGraph: {
    title: "TuitionsTime Services - Online and Offline Tutoring",
    description:
      "Personalized tutoring services for students and parents, with verified tutors for online classes and local offline tuition.",
    url: "https://tuitionstime.com/services",
    siteName: "TuitionsTime",
    type: "website",
  },
};

const serviceCards = [
  {
    title: "Online Tutoring",
    text: "Live classes from anywhere with verified tutors, flexible timing, doubt clearing, and regular academic support.",
    icon: <Laptop className="h-6 w-6" />,
  },
  {
    title: "Offline Tutoring",
    text: "Local tuition options for students who learn better with face-to-face guidance at home, tutor location, or nearby centers where available.",
    icon: <Home className="h-6 w-6" />,
  },
  {
    title: "Free Demo Classes",
    text: "Students can attend a demo session before continuing, so parents can evaluate teaching style, communication, and subject fit.",
    icon: <Video className="h-6 w-6" />,
  },
  {
    title: "Personalized Matching",
    text: "Students are connected with tutors based on class, subject, board, budget, learning mode, location, and preferred time.",
    icon: <Users className="h-6 w-6" />,
  },
];

const onlineDetails = [
  "Live one-to-one sessions for focused attention",
  "Flexible scheduling for school, college, and competitive exam preparation",
  "Useful for students in locations where a suitable local tutor is not available",
  "Easy demo booking before starting regular classes",
];

const offlineDetails = [
  "Local tutor discovery based on city and pincode",
  "Face-to-face learning for students who need closer supervision",
  "Support for home tuition, tutor-home tuition, and nearby offline options where available",
  "Better fit for younger students or learners who need structured in-person guidance",
];

const supportAreas = [
  "School subjects across major boards",
  "College and graduation-level academic support",
  "Competitive exam preparation guidance",
  "Concept clarity, homework help, revision, and exam practice",
  "Regular classes after successful demo and payment confirmation",
  "Study notes, class tracking, and feedback-led improvement",
];

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-4xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                Our Services
              </p>
              <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Online and Offline Tutoring Built Around Every Student
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-700">
                TuitionsTime helps students and parents find the right tutor for
                their academic needs. Whether a student prefers live online
                classes or in-person offline tuition, our platform makes it
                easier to compare tutors, book demo sessions, and start regular
                learning with confidence.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup?role=student"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-primary/90"
                >
                  Find a Tutor
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
                >
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {serviceCards.map((service) => (
              <article
                key={service.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-slate-900">
                  {service.icon}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  {service.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {service.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <article className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
              <Laptop className="h-9 w-9 text-primary" />
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Online Tutoring
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                Online tutoring is designed for students who want expert help
                without being limited by location. A student can connect with a
                tutor from anywhere, attend live sessions, ask questions in real
                time, and continue learning from home.
              </p>
              <p className="mt-3 leading-7 text-slate-700">
                This is useful for busy schedules, exam preparation, subject
                revision, and learners who need access to better tutor choices
                than their local area can provide.
              </p>
              <div className="mt-5">
                <CheckList items={onlineDetails} />
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
              <Home className="h-9 w-9 text-primary" />
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Offline Tutoring
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                Offline tutoring supports students who learn best through
                face-to-face teaching. Parents can look for nearby tutors using
                location filters, and students can receive more direct
                supervision, immediate correction, and structured study support.
              </p>
              <p className="mt-3 leading-7 text-slate-700">
                This option is especially helpful when a student needs routine,
                discipline, handwriting or notebook review, or a more personal
                classroom-like environment.
              </p>
              <div className="mt-5">
                <CheckList items={offlineDetails} />
              </div>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                What We Serve
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                Academic Support From Discovery to Regular Classes
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Our services are not limited to listing tutors. TuitionsTime
                supports the full learning journey: student profile creation,
                tutor discovery, demo booking, class conversion, scheduling,
                feedback, and ongoing academic improvement.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {supportAreas.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <BadgeCheck className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Verified Tutor Profiles
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Tutors can complete their profile and verification so
                  students can make decisions with better trust and clarity.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <CalendarClock className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Time and Budget Based Matching
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Students can share preferred slots and budget, helping tutors
                  and families connect only when there is a practical fit.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <MessageSquareText className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Feedback Led Improvement
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Demo feedback, class history, and ongoing communication help
                  students improve and tutors deliver better support.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-primary p-8 text-slate-950 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap gap-4 text-sm font-medium">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Safe platform
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Online and local options
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Student-first learning
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-bold">
                  Start with a Tutor Who Fits Your Need
                </h2>
                <p className="mt-3 max-w-3xl leading-7">
                  Choose online flexibility or offline personal attention. The
                  goal is the same: better understanding, stronger confidence,
                  and steady academic progress.
                </p>
              </div>
              <Link
                href="/signup?role=student"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Book a Free Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
