const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require("docx");

function heading(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 200 },
  });
}

function subheading(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { after: 100 },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text })],
    bullet: { level: 0 },
    spacing: { after: 50 },
  });
}

function para(text) {
  return new Paragraph({
    children: [new TextRun({ text })],
    spacing: { after: 200 },
  });
}

async function main() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          heading("Tuitionstime Platform — Project Completion Summary"),
          para(
            "This document provides a client-facing summary of the Tuitionstime platform as delivered. It focuses on user journeys, features, reliability, and operational aspects without exposing code-level details."
          ),

          subheading("Overview"),
          para(
            "Tuitionstime is a two-sided education marketplace connecting students and verified tutors. The platform supports discovery, bookings, payments, group classes, regular sessions, analytics, notifications, and administrative oversight."
          ),

          subheading("Core Capabilities"),
          bullet("Authentication and role-based access for Students, Tutors, and Admins"),
          bullet("Tutor profile completion, verification, KYC, and account status management"),
          bullet("Student discovery and search with filters (city, subjects, levels, boards, rates, experience)"),
          bullet("Booking flow: demo sessions, feedback, and upgrade to regular classes"),
          bullet("Payments and wallet with order creation, verification, and transparent transactions"),
          bullet("Group batches with fixed-date scheduling, seat reservation, waitlist, and announcements"),
          bullet("Session management for both group and regular classes, including auto-completion"),
          bullet("Notifications: in-app student announcements and admin notifications for key events"),
          bullet("Progress and analytics views for students and tutors"),
          bullet("Notes and content handling for learning artifacts"),

          subheading("User Journeys"),
          para("Student Journey"),
          bullet("Sign up and login via OTP; access a personalized student dashboard"),
          bullet("Search and discover verified tutors using flexible filters"),
          bullet("Book demo sessions, provide structured feedback, and start regular classes"),
          bullet("Join group batches: reserve a seat, pay securely, and attend scheduled sessions"),
          bullet("Track progress, view upcoming sessions, receive announcements, and manage payments"),

          para("Tutor Journey"),
          bullet("Complete and submit tutor profile with subjects, levels, availability, and media"),
          bullet("Get verified; manage classes, earnings, and sessions from the tutor dashboard"),
          bullet("Create professional group batches with fixed dates sourced from availability"),
          bullet("Broadcast announcements to enrolled students and manage roster"),
          bullet("View analytics, ratings, and utilize scheduling tools"),

          para("Admin Journey"),
          bullet("Access dedicated dashboard to manage users, tutors, KYC, and system-wide settings"),
          bullet("Monitor platform activity via notifications and weekly summaries"),
          bullet("Review bookings and operational metrics; enforce approvals and policies"),

          subheading("Reliability and Security"),
          bullet("Industry-standard security headers and CORS configuration"),
          bullet("Role-based authorization with protected endpoints"),
          bullet("Rate limiting for sensitive operations"),
          bullet("Centralized error handling and health monitoring endpoints"),

          subheading("Operational Automation"),
          bullet("Auto-completion of past demo and session states to maintain data hygiene"),
          bullet("Payout scheduler and weekly reporting for business visibility"),

          subheading("Deliverables and Experience"),
          bullet("Responsive web frontend with modern UI components and clear navigation"),
          bullet("Comprehensive API powering authentication, bookings, payments, and class flows"),
          bullet("Dashboards tailored for Students, Tutors, and Admins with actionable insights"),
          bullet("Support for group batch creation with fixed dates and professional presentation"),
          bullet("End-to-end payment processing and verification for group enrollments"),

          subheading("Summary"),
          para(
            "The platform is production-ready with robust flows for discovery, bookings, secure payments, group classes, and administrative oversight. It provides a consistent and attractive user experience, aligned to real-world tutoring operations."
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDir = path.resolve(process.cwd(), "..", "docs");
  const outPath = path.join(outDir, "Tuitionstime-Project-Summary.docx");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, buffer);
  console.log("Summary generated:", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

