'use client';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import WhyChoose from '@/components/WhyChoose';
import ForStudents from '@/components/ForStudents';
import ForTutors from '@/components/ForTutors';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <HeroSection />
      <WhyChoose />
      <ForStudents />
      <ForTutors />
      <CTASection />
      <Footer />
    </div>
  );
}
