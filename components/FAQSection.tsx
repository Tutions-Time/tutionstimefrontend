"use client";

import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/faqs";
import { fadeInUp, scaleHover, useScrollAnimation } from "./animations";

const previewFaqs = faqs.slice(0, 6);

export default function FAQSection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section ref={ref} className="bg-white py-20">
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primaryWeak px-3 py-1 text-sm font-semibold text-text">
              <HelpCircle className="h-4 w-4" />
              FAQs
            </div>
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              Questions parents and students ask most
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              Find quick answers about tutors, demo classes, subjects, boards,
              safety, timings, and online learning.
            </p>
          </div>

          <Link href="/faq">
            <motion.div whileHover={scaleHover} whileTap={{ scale: 0.95 }}>
              <Button className="bg-primary font-semibold text-text hover:bg-primary/90">
                More FAQs <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {previewFaqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#FFD54F] hover:shadow-md"
            >
              <h3 className="text-base font-semibold leading-snug text-gray-900">
                {faq.question}
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
