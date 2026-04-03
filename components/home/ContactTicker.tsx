"use client";

import { MessageCircle } from "lucide-react";

const contactItems = [
  { label: "Call us", value: "+91 87553 13291", href: "tel:+918755313291" },
  { label: "Email", value: "support@tuitionstime.com", href: "mailto:support@tuitionstime.com" },
];

export default function ContactTicker() {
  return (
    <>
      <div className="border-b bg-primary/10 text-text">
        <div className="mx-auto flex max-w-7xl items-center px-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 text-center">
            {contactItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="contact-ticker-item inline-flex items-center gap-2 text-sm font-medium hover:underline"
              >
                <span className="text-muted">{item.label}:</span>
                <span>{item.value}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
        <a
          href="https://wa.me/918755313291"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-4 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700 sm:bottom-6 sm:right-6"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
    </>
  );
}
