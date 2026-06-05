import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "tuitionstime – Find Verified Tutors Online & Offline Across India",
  description:
    "Find the best verified tutors for every subject from Nursery to Graduation. Book free demo classes, learn online or offline, and achieve better results with tuitionstime.",
};

export default function HomePage() {
  return <HomePageClient />;
}
