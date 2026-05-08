import { redirect } from "next/navigation";
import { getRoleDefaultPath } from "@/lib/roleRoutes";

export default function TutorDashboard() {
  redirect(getRoleDefaultPath("tutor"));
}
