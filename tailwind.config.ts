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
        surface: {
          0: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          border: "var(--surface-border)",
          strong: "var(--surface-border-strong)",
        },
        chalk: "var(--text-primary)",
        steel: "var(--text-secondary)",
        slateMuted: "var(--text-muted)",
        brand: {
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-hover)",
          active: "var(--brand-active)",
          soft: "var(--brand-soft)",
          border: "var(--brand-border)",
        },
        audio: {
          rec: "var(--audio-rec)",
          play: "var(--audio-play)",
          cyan: "var(--audio-cyan)",
          amber: "var(--audio-amber)",
        },
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
