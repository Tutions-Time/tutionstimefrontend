"use client";
import Navbar from "@/components/Navbar";
import ContactTicker from "@/components/home/ContactTicker";
import HeroSection from "@/components/HeroSection";
import WhyChoose from "@/components/WhyChoose";
import WhyChooseUs from "@/components/WhyChooseUs";
import TopTutorsSection from "@/components/TopTutorsSection";
import ForStudents from "@/components/ForStudents";
import ForTutors from "@/components/ForTutors";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AboutUs from "@/components/aboutus";
import FAQSection from "@/components/FAQSection";

export default function HomePageClient() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <ContactTicker />
      <HeroSection />
      <WhyChooseUs />
      <TopTutorsSection />
      <WhyChoose />
      <ForStudents />
      <ForTutors />
      <AboutUs />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}


