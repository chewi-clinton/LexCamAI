/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B4D3E",
          light: "#2D6A4F",
          dark: "#12352A",
        },
        accent: {
          DEFAULT: "#C9882A",
          light: "#E0A84D",
          dark: "#A36E1E",
        },
        surface: "#FFFFFF",
        background: "#F7F4EF",
        muted: "#6B7280",
        danger: "#DC3545",
        success: "#2D6A4F",
        tertiary: {
          DEFAULT: "#673831",
          light: "#8A4D45",
          dark: "#4A2824",
        },
        neutral: {
          DEFAULT: "#757875",
          light: "#A0A3A0",
          dark: "#4A4C4A",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
