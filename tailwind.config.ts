import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080B11",
        surface: "#0D111A",
        "surface-card": "#131824",
        "surface-card-hover": "#171E2E",
        "surface-border": "#1E2638",
        brand: {
          blue: "#1868FE",
          "blue-glow": "#2563EB",
          "blue-light": "#3B82F6",
        },
        accent: {
          green: "#05C46B",
          red: "#FF3F34",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(24, 104, 254, 0.4)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
