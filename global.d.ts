/* global.d.ts */
export {};

declare module "*.css";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => any;
  }
}
