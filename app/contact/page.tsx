import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact TuitionsTime – Get Help & Support Anytime",
  description:
    "Need help finding a tutor or using TuitionsTime? Contact our support team for quick assistance and personalized guidance.",
};

export default function ContactPage() {
  return <ContactClient />;
}
