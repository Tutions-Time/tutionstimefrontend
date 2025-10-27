'use client';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

export const MotionDiv: React.FC<HTMLMotionProps<'div'>> = (props) => (
  <motion.div {...props} />
);

export const MotionH1: React.FC<HTMLMotionProps<'h1'>> = (props) => (
  <motion.h1 {...props} />
);

export const MotionP: React.FC<HTMLMotionProps<'p'>> = (props) => (
  <motion.p {...props} />
);

export const MotionSpan: React.FC<HTMLMotionProps<'span'>> = (props) => (
  <motion.span {...props} />
);
