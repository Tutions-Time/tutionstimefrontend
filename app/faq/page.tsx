import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { faqs } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "FAQs | Tuitionstime",
  description:
    "Frequently asked questions about Tuitionstime home tutors, online tuition, demo classes, subjects, boards, fees, tutor verification, and support.",
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="border-b bg-[#FFF8DF] py-14 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9A6A00]">
              Help Center
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-gray-700 sm:text-lg">
              Clear answers about finding tutors, booking demo classes,
              learning online or at home, tutor verification, student support,
              and joining Tuitionstime as a tutor.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={faq.question}
                  className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                  open={index < 3}
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                    <span className="text-base font-semibold leading-6 text-gray-950">
                      {index + 1}. {faq.question}
                    </span>
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFD54F] text-lg font-semibold leading-none text-black group-open:hidden">
                      +
                    </span>
                    <span className="mt-0.5 hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-lg font-semibold leading-none text-white group-open:flex">
                      -
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-6 text-gray-700 sm:text-base">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
