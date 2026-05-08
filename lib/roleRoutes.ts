export type DashboardRole = "student" | "tutor" | "admin";

export const getRoleDefaultPath = (role?: DashboardRole | string | null) => {
  switch (role) {
    case "student":
      return "/dashboard/student/search";
    case "tutor":
      return "/dashboard/tutor/search";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/";
  }
};
