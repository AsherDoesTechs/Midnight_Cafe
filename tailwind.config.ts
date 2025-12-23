/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- MODERN MINIMALIST MAPPING ---
        // These map directly to the colors used in the JavaScript components.
        "bg-darkest": "#121212", // Main background
        "bg-medium": "#1A1A1A", // Section/Card background
        "border-clean": "#444444", // Clean, soft border
        "accent-modern": "#00AEEF", // Primary accent (Cyan/Aqua)
        "text-light": "#D0C8B3", // Primary text (Warm Beige/Light Gray)
        "text-muted": "#B8B1A0", // Secondary text
        "text-subtle": "#777777", // Very subtle text (for descriptions/placeholders)
      },
      fontFamily: {
        // Keeping 'poppins' as the standard minimalist sans-serif font
        poppins: ["Poppins", "sans-serif"],
      },

      // 🗑️ Removed all previous 'backgroundImage' definitions (hero, menu, about, contact)
      // as the Modern Minimalist design uses solid background colors and borders.

      // 🗑️ Removed all previous custom animations/keyframes (float, glow-pulse, shake, flicker, scroll)
      // and only rely on the standard Tailwind animations (like 'animate-pulse' for skeleton)
      // or simple CSS keyframes defined directly in the component (like 'slide-up').
      animation: {
        // No custom global animations needed for this theme
      },
      keyframes: {
        // No custom keyframes needed for this theme
      },
    },
  },
  plugins: [],
};
