'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fadeInUp as fadeIn, floatHover as scaleHover } from './animations';


export default function Navbar() {
  return (
    <motion.nav
      className="border-b bg-white sticky top-0 z-50 backdrop-blur-lg bg-opacity-90"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            className="flex items-center gap-2"
            whileHover={scaleHover}
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-text">
              T
            </div>
            <span className="font-bold text-xl text-text">Tuitions time</span>
          </motion.div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <motion.div whileHover={scaleHover} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost">Login</Button>
              </motion.div>
            </Link>
            <Link href="/signup">
              <motion.div whileHover={scaleHover} whileTap={{ scale: 0.95 }}>
                <Button className="bg-primary hover:bg-primary/90 text-text font-semibold">
                  Get Started
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
