import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ["var(--font-bebas-neue)", "sans-serif"],
        dm: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        f7: {
          bg: "#0a0e1a",
          bg2: "#111827",
          bg3: "#1a2235",
          bg4: "#222d42",
          accent: "#00e5a0",
          accent2: "#3b82f6",
          accent3: "#f59e0b",
          red: "#ef4444",
          text: "#f1f5f9",
          text2: "#94a3b8",
          text3: "#64748b",
          border: "#1e2d45",
          border2: "#2a3a55",
        },
      },
    },
  },
  plugins: [],
};

export default config;
