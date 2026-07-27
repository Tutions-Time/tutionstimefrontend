"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Search,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Step = {
  title: string;
  text: string;
  icon: React.ReactNode;
};

const studentSteps: Step[] = [
  {
    title: "Create Your Account",
    text: "Sign up for free and share the class, subject, learning mode, and schedule you need.",
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    title: "Get Profile Ready",
    text: "Complete your student or parent profile so tutors can understand your learning requirements clearly.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    title: "Find Verified Tutors",
    text: "Search tutors by subject, class, preferred time, teaching mode, location, and profile details.",
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: "Book a Demo",
    text: "Choose a tutor and schedule a demo session at a time that works for both sides.",
    icon: <CalendarCheck className="h-5 w-5" />,
  },
  {
    title: "Review Credentials",
    text: "Check tutor experience, qualification, teaching style, and comfort before moving ahead.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: "Start Paid Classes",
    text: "After a successful demo, complete the payment and continue with regular learning sessions.",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Share Feedback",
    text: "Track sessions and give feedback so your learning experience keeps improving.",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Track Progress",
    text: "Use regular classes, notes, assignments, and feedback to monitor academic growth.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

const tutorSteps: Step[] = [
  {
    title: "Join as Tutor",
    text: "Create your free tutor account and start setting up your teaching profile.",
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    title: "Build Your Profile",
    text: "Add your subjects, qualifications, experience, teaching mode, location, and fees.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Complete Verification",
    text: "Submit profile and KYC details so students can trust your profile before booking.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    title: "Find Student Requests",
    text: "Browse matching students by subject, class, timing, learning mode, and city.",
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: "Schedule Demos",
    text: "Invite students or respond to incoming demo requests based on your availability.",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Teach Regularly",
    text: "After demo confirmation and payment, conduct regular sessions through the platform.",
    icon: <CalendarCheck className="h-5 w-5" />,
  },
  {
    title: "Grow Earnings",
    text: "Build your reputation, manage classes, and track your earnings from your dashboard.",
    icon: <Wallet className="h-5 w-5" />,
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/70 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-slate-950">
          {step.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Step {index + 1}
            </span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <h3 className="mt-1 text-base font-semibold text-slate-950">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
        </div>
      </div>
    </li>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="border-b bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                How it works
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Learn or teach with a clear, trusted process
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                tuitionstime helps students find verified tutors, attend demo
                classes, and continue learning with transparent scheduling,
                payments, and progress tracking.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup?role=student"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-primary/90"
                >
                  Book a Free Demo
                </Link>
                <Link
                  href="/signup?role=tutor"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                >
                  Join as Tutor
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
              For Students and Parents
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              From searching tutors to continuing regular classes, every step is
              designed to make tutor selection simple and transparent.
            </p>
          </div>

          <ol className="grid gap-4 md:grid-cols-2">
            {studentSteps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </ol>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-3xl">
              <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                For Tutors
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Create a professional profile, connect with suitable students,
                manage classes, and grow your teaching income.
              </p>
            </div>

            <ol className="grid gap-4 md:grid-cols-2">
              {tutorSteps.map((step, index) => (
                <StepCard key={step.title} step={step} index={index} />
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-slate-950 p-8 text-white sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-bold">Ready to get started?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Choose your role and continue to the right dashboard flow in a
                  few clicks.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup?role=student"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary/90"
                >
                  Start Learning
                </Link>
                <Link
                  href="/signup?role=tutor"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Start Teaching
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
