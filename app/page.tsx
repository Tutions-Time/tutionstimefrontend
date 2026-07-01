import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Home Tutor | Home Tuition | Online Tutor | Home Tuition in India",
  description:
    "Looking for home tuition in India? Find verified home tutors and online tutors for all subjects from Nursery to Graduation. Book your free demo with Tuitionstime today.",
};

export default function HomePage() {
  return <HomePageClient />;
}
