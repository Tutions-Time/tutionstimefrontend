import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  IndianRupee,
  Lightbulb,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About TuitionsTime - Trusted Tutors Across India",
  description:
    "Learn about TuitionsTime, a modern tutoring platform connecting students with verified tutors across India for personalized online and offline learning.",
  alternates: {
    canonical: "https://tuitionstime.com/about-us",
  },
  openGraph: {
    title: "About TuitionsTime - Your Learning Journey Begins Here",
    description:
      "TuitionsTime helps students find verified tutors, book free demo classes, and learn with flexible, personalized support.",
    url: "https://tuitionstime.com/about-us",
    siteName: "TuitionsTime",
    type: "website",
  },
};

const highlights = [
  { value: "10,000+", label: "Active Students" },
  { value: "2,000+", label: "Expert Tutors" },
  { value: "50,000+", label: "Classes Completed" },
];

const offers = [
  {
    title: "Personalized Learning Experience",
    text: "One-to-one tutoring helps students ask questions freely, clear doubts quickly, and learn at their own pace.",
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    title: "Verified & Experienced Tutors",
    text: "Tutors go through verification and screening so students learn from skilled, knowledgeable educators.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    title: "Flexible Learning Options",
    text: "Choose online classes, offline tutoring where available, and schedules that fit your availability.",
    icon: <CalendarCheck className="h-5 w-5" />,
  },
  {
    title: "Free Demo Classes",
    text: "Attend a demo before committing so students and parents can choose the right tutor confidently.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    title: "Transparent Pricing",
    text: "Clear fee structures help families understand exactly what they are paying for.",
    icon: <IndianRupee className="h-5 w-5" />,
  },
  {
    title: "Continuous Performance Tracking",
    text: "Regular feedback, assessments, and performance insights support consistent improvement.",
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

const reasons = [
  "Student-centric approach",
  "Wide range of subjects",
  "Strong tutor network",
  "Easy-to-use platform",
  "Safe and secure environment",
];

const steps = [
  "Tell us your subject, class, schedule, and preferred learning mode.",
  "Get matched with suitable tutors based on your needs.",
  "Book a free demo class to evaluate teaching style and compatibility.",
  "Choose your tutor and begin your personalized learning journey.",
];

const studentBenefits = [
  "Find tutors based on subject, rating, and budget",
  "Attend demo classes before making a decision",
  "Learn at your own pace with personalized sessions",
  "Access study materials, notes, and recorded classes",
  "Track progress and improve performance",
];

const tutorBenefits = [
  "Set your own schedule and availability",
  "Teach online from anywhere",
  "Connect directly with students",
  "Earn competitive income",
  "Use built-in tools like video conferencing and whiteboards",
  "Track your performance and earnings",
];

const learningApproach = [
  {
    title: "Concept Clarity",
    text: "We emphasize understanding rather than memorization.",
  },
  {
    title: "Interactive Sessions",
    text: "Engaging classes make learning more enjoyable and effective.",
  },
  {
    title: "Goal-Oriented Learning",
    text: "Students receive support aligned with their specific academic goals.",
  },
  {
    title: "Continuous Improvement",
    text: "Assessments and feedback help students measure and improve performance.",
  },
];

const values = ["Integrity", "Excellence", "Innovation", "Accessibility"];

const futureGoals = [
  "Expand the tutor network across more cities",
  "Introduce advanced learning tools and AI-based recommendations",
  "Add more courses and skill-based learning programs",
  "Enhance student engagement and performance tracking systems",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About TuitionsTime",
  url: "https://tuitionstime.com/about-us",
  description:
    "TuitionsTime connects students with verified tutors across India for personalized online and offline learning.",
  mainEntity: {
    "@type": "Organization",
    name: "TuitionsTime",
    url: "https://tuitionstime.com",
    email: "support@tuitionstime.com",
    telephone: "+918755313291",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "House Number-530 Ahmedlda pura, Beside Om Dhara Nursery, Jhalu Road",
      addressLocality: "Bijnor",
      addressRegion: "Uttar Pradesh",
      postalCode: "246701",
      addressCountry: "IN",
    },
  },
};

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
      {text ? <p className="mt-3 max-w-3xl text-slate-600">{text}</p> : null}
    </div>
  );
}

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

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Script
        id="about-us-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main>
        <section className="bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                About TuitionsTime
              </p>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Your Learning Journey Begins Here
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
                At TuitionsTime, we believe education is not just about passing
                exams. It is about building confidence, understanding concepts
                deeply, and unlocking every student&apos;s true potential.
              </p>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                We connect students with highly qualified tutors across India,
                giving parents, students, and lifelong learners a trusted
                platform for personalized guidance, flexible learning, and
                expert academic support.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup?role=student"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-text shadow-sm transition hover:bg-primary/90"
                >
                  Find a Tutor
                </Link>
                <Link
                  href="/signup?role=tutor"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
                >
                  Join as a Tutor
                </Link>
              </div>
            </div>

            <div className="grid content-end gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-3xl font-bold text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Who We Are"
            title="A Complete Learning Ecosystem"
            text="TuitionsTime is more than a tutoring platform. Built with the vision to make quality education accessible and affordable, we bring students and tutors together where learning becomes simple, effective, and engaging."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <p className="leading-7 text-slate-700">
                Every student is different. Some need extra attention in
                specific subjects, while others want to excel beyond classroom
                curriculum. That is why we focus on personalized learning
                experiences rather than a one-size-fits-all approach.
              </p>
              <p className="mt-4 leading-7 text-slate-700">
                Our platform supports students from Nursery to Graduation level,
                covering Mathematics, Science, English, Computer Science,
                Commerce, and many more subjects.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <BookOpen className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Built for Every Learner
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                From school support to advanced academic topics, TuitionsTime
                helps learners find the right guidance at the right time.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Our Mission
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                To make high-quality education accessible, flexible, and
                personalized for every student, everywhere.
              </p>
              <div className="mt-5">
                <CheckList
                  items={[
                    "Easy access to expert educators",
                    "Customized learning experiences",
                    "Affordable and transparent pricing",
                    "Continuous academic improvement",
                  ]}
                />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
              <Sparkles className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Our Vision
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                To become India&apos;s most trusted and preferred tutoring
                platform by combining technology, expertise, and innovation.
              </p>
              <div className="mt-5">
                <CheckList
                  items={[
                    "Students feel confident and motivated",
                    "Tutors can share knowledge effectively",
                    "Learning is no longer limited by location or time",
                    "Education becomes a lifelong journey",
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Offer"
            title="Flexible Support for Students and Parents"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <article
                key={offer.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-slate-900">
                  {offer.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {offer.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {offer.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                Why Choose Us
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                Built Around Better Learning Outcomes
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                We prioritize student needs, verified tutors, transparent
                pricing, and a secure platform so families can focus on
                learning.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {reasons.map((reason) => (
                <div
                  key={reason}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-slate-700">
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How It Works"
            title="Start Learning in Four Simple Steps"
          />
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-slate-950">
                  {index + 1}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                For Students
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                We help students succeed academically and beyond by making
                learning enjoyable, personal, and stress-free.
              </p>
              <div className="mt-5">
                <CheckList items={studentBenefits} />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                For Tutors
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                TuitionsTime gives educators a flexible platform to share their
                knowledge, grow professionally, and focus on teaching.
              </p>
              <div className="mt-5">
                <CheckList items={tutorBenefits} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Quality and Approach"
            title="Meaningful Learning, Measurable Progress"
            text="Quality education is at the core of everything we do, supported by strict tutor verification, consistent teaching standards, regular feedback, and continuous platform improvement."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {learningApproach.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Our Values</h2>
              <div className="mt-5">
                <CheckList items={values} />
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Our work is guided by honesty, transparency, quality,
                innovation, and a commitment to making education available to
                everyone.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Future Goals
              </h2>
              <div className="mt-5">
                <CheckList items={futureGoals} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-primary p-8 text-slate-950 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide">
                  Join the TuitionsTime Community
                </p>
                <h2 className="mt-2 text-3xl font-bold">Get Started Today</h2>
                <p className="mt-3 max-w-3xl leading-7">
                  Whether you are a student looking to improve academic
                  performance or a tutor passionate about teaching, TuitionsTime
                  is built to make learning simple, effective, and enjoyable.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/signup?role=student"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  Book a Free Demo
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-950/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/30"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Tutors across India
            </span>
            <span className="inline-flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Secure learning environment
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
