import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login to tuitionstime – Access Your Learning Dashboard",
  description:
    "Login to your tuitionstime account to manage classes, book tutors, track progress, or teach students with ease.",
};

export default function LoginPage() {
  return <LoginClient />;
}
