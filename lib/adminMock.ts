// lib/adminMock.ts
export const MockAdmin = {
  users: [
    { id: "U001", name: "Amit", role: "student", phone: "98xxxxxx01", created: "2025-10-01" },
    { id: "U002", name: "Neha", role: "tutor", phone: "98xxxxxx02", created: "2025-10-02" },
    { id: "U003", name: "Admin", role: "admin", phone: "98xxxxxx03", created: "2025-10-03" },
  ],
  tutorsPending: [
    {
      id: "T101",
      name: "Rahul Sharma",
      subjects: ["Mathematics", "Physics"],
      experience: "3–5 years",
      qualification: "M.Sc",
      hourlyRate: "600",
      pincode: "110001",
      bio: "I focus on fundamentals and problem-solving.",
      certificateUrl: "",
      demoVideoUrl: "",
      status: "Pending" as const,
    },
    {
      id: "T102",
      name: "Priya Verma",
      subjects: ["English"],
      experience: "6–10 years",
      qualification: "M.A",
      hourlyRate: "500",
      pincode: "560001",
      bio: "Interactive learning with weekly tests.",
      certificateUrl: "",
      demoVideoUrl: "",
      status: "Pending" as const,
    },
  ],
};
