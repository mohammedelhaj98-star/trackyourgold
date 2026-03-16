import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#070B14",
          900: "#0C1220",
          850: "#11192A",
          800: "#162033",
          700: "#24314A"
        },
        gold: {
          50: "#FFF9E7",
          100: "#FFF0BC",
          200: "#FBD96A",
          300: "#F2C84B",
          400: "#D7A530",
          500: "#B9891E"
        },
        aqua: {
          300: "#7EE7E0",
          400: "#43C6BE",
          500: "#229C95"
        }
      },
      boxShadow: {
        glow: "0 12px 48px rgba(185, 137, 30, 0.18)",
        panel: "0 18px 60px rgba(5, 10, 20, 0.35)"
      },
      backgroundImage: {
        "grid-fade": "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
