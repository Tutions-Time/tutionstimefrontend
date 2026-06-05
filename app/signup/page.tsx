import type { Metadata } from "next";
import SignupClient from "./SignupClient";

type SearchParams = { role?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams;
}): Promise<Metadata> {
  const role = (searchParams?.role || "").toLowerCase();

  if (role === "student") {
    return {
      title: "Student Signup – Learn Smarter with Expert Tutors | tuitionstime",
      description:
        "Join tuitionstime as a student and connect with verified tutors. Book free demo classes, choose flexible timings, and get personalized learning support.",
    };
  }

  if (role === "tutor") {
    return {
      title: "Become a Tutor – Teach Online & Earn Flexibly | tuitionstime",
      description:
        "Register as a tutor on tuitionstime and start teaching students across India. Set your own schedule, earn securely, and grow your teaching career.",
    };
  }

  return {
    title: "Sign Up on tuitionstime – Start Learning or Teaching Today",
    description:
      "Create your free tuitionstime account to learn from expert tutors or start teaching students across India. Flexible schedules, free demo classes, and secure payments.",
  };
}

export default function SignupPage() {
  return <SignupClient />;
}
