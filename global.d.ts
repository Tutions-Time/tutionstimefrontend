/* global.d.ts */
export {};

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => any;
  }
}
