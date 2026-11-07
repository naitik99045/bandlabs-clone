import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: "#09090b",
          900: "#121217",
          850: "#181820",
          800: "#22222e",
          700: "#2e2e3d",
          600: "#444459",
          500: "#60607a",
          accent: "#ff3b30", // BandLab signature red
          accentHover: "#e03126",
          cyan: "#00d2ff",
          green: "#10b981",
          purple: "#8b5cf6",
          amber: "#f59e0b"
        },
      },
    },
  },
  plugins: [],
};

export default config;
