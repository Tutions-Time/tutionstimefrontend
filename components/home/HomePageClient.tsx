"use client";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyChoose from "@/components/WhyChoose";
import WhyChooseUs from "@/components/WhyChooseUs";
import ForStudents from "@/components/ForStudents";
import ForTutors from "@/components/ForTutors";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AboutUs from "@/components/aboutus";

export default function HomePageClient() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <HeroSection />
      <WhyChooseUs />
      <WhyChoose />
      <ForStudents />
      <ForTutors />
      <AboutUs />
      <CTASection />
      <Footer />
    </div>
  );
}
