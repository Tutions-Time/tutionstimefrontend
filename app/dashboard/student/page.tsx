import { redirect } from "next/navigation";
import { getRoleDefaultPath } from "@/lib/roleRoutes";

export default function StudentDashboard() {
  redirect(getRoleDefaultPath("student"));
}
