'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { fadeInUp, scaleHover, useScrollAnimation } from './animations';

export default function ForStudents() {
  const { ref, isInView } = useScrollAnimation();

  const features = [
    'Find tutors by subject, rating, and price',
    'Book demo classes before committing',
    'Secure payment with wallet integration',
    'Access recordings and notes anytime',
    'Track your learning progress',
  ];

  // ------------------ TESTIMONIALS ------------------
  const testimonials = [
    {
      initials: "JD",
      name: "John Doe",
      stars: 5,
      course: "Computer Science Student",
      review:
        "TuitionTime transformed my learning experience. The tutors are incredibly knowledgeable and the platform is so easy to use!",
    },
    {
      initials: "SP",
      name: "Sneha Patel",
      stars: 5,
      course: "Class 10 - CBSE",
      review:
        "I improved my Maths score from 62% to 89% thanks to the amazing tutors. Live classes and notes helped a lot!",
    },
    {
      initials: "RK",
      name: "Rahul Kumar",
      stars: 4,
      course: "JEE Preparation",
      review:
        "Loved the flexibility of booking demo classes. My Physics tutor explained everything so clearly!",
    },
    {
      initials: "AM",
      name: "Ayesha Malik",
      stars: 5,
      course: "NEET Aspirant",
      review:
        "The recorded lectures and one-on-one sessions helped me revise properly. Highly recommended!",
    },
  ];

  const [index, setIndex] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const slideVariants = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  return (
    <section
      ref={ref}
      className="relative py-20 bg-[#FFD54F] overflow-hidden"
    >
      {/* Decorative blur glow */}
      <motion.div
        className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/30 blur-3xl rounded-full"
        animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-2 gap-16 items-center"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* ---------- LEFT CONTENT ---------- */}
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">
            For Students
          </h2>
          <p className="text-lg text-gray-800 mb-8 leading-relaxed">
            Access quality education from the comfort of your home with
            personalized and engaging learning experiences.
          </p>

          <div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                whileHover={scaleHover}
              >
                <CheckCircle className="w-6 h-6 text-gray-900 shrink-0 mt-0.5" />
                <p className="text-gray-900 font-medium">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>

     {/* ---------- SLIDING TESTIMONIALS WITH ARROWS + DOTS ---------- */}
<div className="relative min-h-[300px] flex flex-col items-center">
  <AnimatePresence mode="wait">
    <motion.div
      key={index}
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative p-8 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] bg-white border border-gray-100 w-full max-w-md"
    >
      {/* TOP PROFILE */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-[#FFD54F] flex items-center justify-center text-gray-900 font-bold text-xl shadow-inner">
          {testimonials[index].initials}
        </div>
        <div>
          <p className="font-bold text-gray-900">
            {testimonials[index].name}
          </p>
          <div className="flex items-center gap-1">
            {[...Array(testimonials[index].stars)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#FFD54F] text-[#FFD54F]" />
            ))}
          </div>
        </div>
      </div>

      {/* REVIEW */}
      <p className="text-gray-700 italic mb-4">
        {testimonials[index].review}
      </p>

      <p className="text-sm font-semibold text-gray-900">
        {testimonials[index].course}
      </p>

      {/* Subtle decorative accent */}
      <motion.div
        className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#FFE97F] blur-2xl rounded-full opacity-70"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  </AnimatePresence>

  {/* ---------- ARROW BUTTONS ---------- */}
  <div className="flex items-center gap-6 mt-6">
    <button
      onClick={() =>
        setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
      }
      className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
    >
      ←
    </button>

    <button
      onClick={() =>
        setIndex((prev) => (prev + 1) % testimonials.length)
      }
      className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
    >
      →
    </button>
  </div>

  {/* ---------- PAGINATION DOTS ---------- */}
  <div className="flex gap-2 mt-4">
    {testimonials.map((_, i) => (
      <div
        key={i}
        className={`w-3 h-3 rounded-full transition-all ${
          i === index ? "bg-gray-900 w-6" : "bg-gray-500/40"
        }`}
      />
    ))}
  </div>
</div>

      </motion.div>
    </section>
  );
}
