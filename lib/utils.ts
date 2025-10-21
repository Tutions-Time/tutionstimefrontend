import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names conditionally and merges Tailwind classes intelligently.
 * Supports strings, arrays, and objects (just like clsx).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
