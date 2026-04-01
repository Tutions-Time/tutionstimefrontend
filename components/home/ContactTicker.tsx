"use client";

import { MessageCircle } from "lucide-react";

const contactItems = [
  { label: "Call us", value: "+91 87553 13291", href: "tel:+918755313291" },
  { label: "Email", value: "support@tuitionstime.com", href: "mailto:support@tuitionstime.com" },
];

const tickerEntries = [...contactItems, ...contactItems];

export default function ContactTicker() {
  return (
    <div className="border-b bg-primary/10 text-text">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 sm:px-6 lg:px-8">
        <a
          href="https://wa.me/918755313291"
          target="_blank"
          rel="noreferrer"
          className="my-2 inline-flex shrink-0 items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp Chat</span>
        </a>
        <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
          <div className="contact-ticker-track inline-flex min-w-full items-center">
          {tickerEntries.map((item, index) => (
            <a
              key={`${item.label}-${index}`}
              href={item.href}
              className="contact-ticker-item inline-flex items-center gap-2 px-6 py-2 text-sm font-medium hover:underline"
            >
              <span className="text-muted">{item.label}:</span>
              <span>{item.value}</span>
            </a>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
