"use client";

import Link from "next/link";
import {
  UserPlus,
  BadgeCheck,
  Search,
  CalendarCheck,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  TrendingUp,
  BookOpen,
  Wallet,
  Users,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Step = {
  text: string;
  icon: React.ReactNode;
};

const studentSteps: Step[] = [
  {
    text: "Sign up for free on our website and tell us what kind of tuition you’re looking for.",
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    text: "Register as a free student or parent member. Our team will quickly verify your profile, and once approved, it will be visible on the platform.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    text: "Browse through tutor profiles and filter them by your preferred time, class, subject, teaching mode (online or offline), or city.",
    icon: <Search className="h-5 w-5" />,
  },
  {
    text: "Choose a tutor you like and book a demo session at a time and mode that works best for you.",
    icon: <CalendarCheck className="h-5 w-5" />,
  },
  {
    text: "Before you move ahead, take a moment to check the tutor’s credentials and make sure you’re comfortable with them.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    text: "After the demo session, pay the tuition fee in advance to the Tuition Time account. Once the payment is confirmed, we’ll share the contact details of both the student and the tutor.",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    text: "Keep track of the tuition sessions and share your feedback—it helps other students and parents make better choices.",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    text: "With the right private tutor or mentor, learning becomes more effective, and you can easily track your academic progress along the way.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

const tutorSteps: Step[] = [
  {
    text: "Sign up for free on Tuitions time and join as a tutor in just a few minutes.",
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    text: "Create your profile, showcase your skills, and set your own fees (hourly or monthly).",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    text: "Our team will verify your profile, and once approved, it will go live so students can find you.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    text: "Browse student requirements based on your availability, teaching mode (online/offline), subject, class, or city.",
    icon: <Search className="h-5 w-5" />,
  },
  {
    text: "Choose students that match your schedule and book demo sessions at your convenience.",
    icon: <Users className="h-5 w-5" />,
  },
  {
    text: "After a successful demo and payment confirmation, student contact details are shared so you can start teaching.",
    icon: <CalendarCheck className="h-5 w-5" />,
  },
  {
    text: "Earn while you learn—gain experience, build your profile, and become financially independent.",
    icon: <Wallet className="h-5 w-5" />,
  },
];

function StepItem({ step }: { step: Step }) {
  return (
    <li className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 p-2 items-center justify-center rounded-lg bg-primary text-black">
        {step.icon}
      </div>
      <p className="text-sm leading-6 text-slate-700">{step.text}</p>
    </li>
  );
}

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          How Tuitions time Works
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Simple, transparent, and trusted tuition booking for students, parents,
          and tutors.
        </p>

        {/* <div className="mt-6">
          <Link
            href="/"
            className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-black shadow"
          >
            Get Free Demo Class
          </Link>
        </div> */}
      </section>

      {/* Students */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          How It Works For <span className="text-primary">Students</span>
        </h2>

        <ul className="grid gap-4 md:grid-cols-2">
          {studentSteps.map((step, i) => (
            <StepItem key={i} step={step} />
          ))}
        </ul>
      </section>

      {/* Tutors */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          How It Works For <span className="text-primary">Tutors</span>
        </h2>

        <p className="mb-6 text-slate-600">
          Join as a Tutor – Start Earning Today (Free)
        </p>

        <ul className="grid gap-4 md:grid-cols-2">
          {tutorSteps.map((step, i) => (
            <StepItem key={i} step={step} />
          ))}
        </ul>
      </section>
    </main>
  );
}
