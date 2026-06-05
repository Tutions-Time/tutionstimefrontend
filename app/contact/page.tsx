import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact tuitionstime – Get Help & Support Anytime",
  description:
    "Need help finding a tutor or using tuitionstime? Contact our support team for quick assistance and personalized guidance.",
};

export default function ContactPage() {
  return <ContactClient />;
}
