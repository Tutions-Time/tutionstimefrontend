"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-text">
                T
              </div>
              <span className="font-bold text-xl text-text">Tuitions time</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-text font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-text leading-tight mb-6">
                Learn Smarter,
                <br />
                <span className="text-primary">Teach Better</span>
              </h1>
              <p className="text-lg text-muted mb-8 leading-relaxed">
                Connect with expert tutors for personalized learning, or share
                your knowledge and earn by teaching students worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-text font-semibold w-full sm:w-auto"
                  >
                    Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signup?role=tutor">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Become a Tutor
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-12">
                <div>
                  <p className="text-3xl font-bold text-text">10K+</p>
                  <p className="text-sm text-muted">Active Students</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-text">2K+</p>
                  <p className="text-sm text-muted">Expert Tutors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-text">50K+</p>
                  <p className="text-sm text-muted">Classes Completed</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl transform rotate-3"></div>
              <Card className="relative p-8 rounded-2xl shadow-soft bg-white transform -rotate-3 hover:rotate-0 transition-base">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-primaryWeak rounded"></div>
                    <div className="h-4 bg-primaryWeak rounded"></div>
                    <div className="h-4 bg-primaryWeak rounded w-5/6"></div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">
              Why Choose Tuitions time?
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Experience the future of online education with our comprehensive
              platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 rounded-2xl shadow-soft hover:shadow-lg transition-base bg-white">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">
                Verified Tutors
              </h3>
              <p className="text-muted leading-relaxed">
                All tutors go through a rigorous verification process to ensure
                quality education
              </p>
            </Card>

            <Card className="p-8 rounded-2xl shadow-soft hover:shadow-lg transition-base bg-white">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Live Classes</h3>
              <p className="text-muted leading-relaxed">
                Interactive one-on-one sessions with whiteboard, screen sharing,
                and recording
              </p>
            </Card>

            <Card className="p-8 rounded-2xl shadow-soft hover:shadow-lg transition-base bg-white">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">
                Track Progress
              </h3>
              <p className="text-muted leading-relaxed">
                Comprehensive analytics and progress tracking for students and
                tutors
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-text mb-6">
                For Students
              </h2>
              <p className="text-lg text-muted mb-8">
                Access quality education from the comfort of your home with
                personalized learning experiences
              </p>
              <div className="space-y-4">
                {[
                  "Find tutors by subject, rating, and price",
                  "Book demo classes before committing",
                  "Secure payment with wallet integration",
                  "Access recordings and notes anytime",
                  "Track your learning progress",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5" />
                    <p className="text-text">{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8 rounded-2xl shadow-soft bg-gradient-to-br from-primaryWeak to-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary"></div>
                <div>
                  <p className="font-bold text-text">John Doe</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted italic mb-4">
                &quot;Tuitions time transformed my learning experience. The
                tutors are incredibly knowledgeable and the platform is so easy
                to use!&quot;
              </p>
              <p className="text-sm font-medium text-text">
                Computer Science Student
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Card className="p-8 rounded-2xl shadow-soft bg-gradient-to-br from-primaryWeak to-white order-2 lg:order-1">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-muted">This Month</p>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-text">₹45,680</p>
                  <p className="text-sm text-muted mt-1">Total Earnings</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-text">28</p>
                    <p className="text-sm text-muted">Classes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text">4.9</p>
                    <p className="text-sm text-muted">Rating</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-bold text-text mb-6">
                For Tutors
              </h2>
              <p className="text-lg text-muted mb-8">
                Share your expertise and earn money while making a difference in
                students&apos; lives
              </p>
              <div className="space-y-4">
                {[
                  "Set your own rates and schedule",
                  "Secure and instant payments",
                  "Built-in video conferencing and whiteboard",
                  "Track your earnings and performance",
                  "Grow your student base",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5" />
                    <p className="text-text">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/10 to-primaryWeak">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-text mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted mb-8">
            Join thousands of students and tutors already using Tuitions time
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-text hover:bg-text/90 text-white font-semibold"
            >
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-text">
                  T
                </div>
                <span className="font-bold text-xl text-text">
                  Tuitions time
                </span>
              </div>
              <p className="text-sm text-muted">
                Empowering education through technology
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-4">For Students</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/search" className="hover:text-text">
                    Find Tutors
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-text">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-4">For Tutors</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/signup?role=tutor" className="hover:text-text">
                    Become a Tutor
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-text">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <a href="#" className="hover:text-text">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-text">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted">
            <p>&copy; 2024 Tuitions time. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
